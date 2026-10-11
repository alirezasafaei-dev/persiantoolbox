#!/bin/sh
# Fixed root-owned deployment path and serialized startup/reload on a dedicated host.
set -eu
[ "$(id -u)" = 0 ] || exit 1
[ "$#" = 1 ] || exit 2
case "$1" in start|stop|reload-ufw) ;; *) exit 2 ;; esac
# Emergency containment does not depend on Compose files or secret env files.
emergency_stop() {
  ids=$(docker ps -q --filter label=pt.image-generation.role=provider-browser) || return 1
  for container in $ids; do
    docker update --restart=no "$container" >/dev/null || return 1
    docker stop -t 0 "$container" >/dev/null || return 1
  done
  remaining=$(docker ps -q --filter label=pt.image-generation.role=provider-browser) || return 1
  [ -z "$remaining" ] || { echo 'Emergency browser stop failed' >&2; return 1; }
}
trap 'emergency_stop || { echo "Emergency browser containment failed" >&2; exit 1; }' EXIT
trap 'exit 1' HUP INT TERM
cd /opt/persiantoolbox-image
exec 9>/run/lock/pt-image-stack.lock
flock -x 9
compose() { docker compose -p pt-image-production "$@"; }
stop() { compose stop -t 30 image-worker; compose stop -t 0 image-browser; compose stop -t 15 image-egress; }
# Existing queues must be drained by the operator.
emergency_stop
stop
if [ "$1" = stop ]; then exit 0; fi
if [ "$1" = reload-ufw ]; then ufw reload; fi
/usr/local/libexec/pt-image-host-guard.sh apply
/usr/local/libexec/pt-image-host-guard.sh check
compose create --no-build image-egress image-browser image-worker
node /usr/local/libexec/pt-image-host-network-check.mjs
compose start image-egress
compose start image-browser
wait_healthy() {
  container=$(compose ps -a -q "$1")
  [ -n "$container" ] || return 1
  attempt=0
  while [ "$attempt" -lt 45 ]; do
    health=$(docker inspect --format '{{.State.Health.Status}}' "$container")
    [ "$health" = healthy ] && return 0
    attempt=$((attempt + 1))
    sleep 1
  done
  echo 'Image service readiness timeout' >&2
  return 1
}
wait_healthy image-browser
compose start image-worker
wait_healthy image-worker
trap - EXIT
