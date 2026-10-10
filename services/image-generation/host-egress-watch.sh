#!/bin/sh
# A firewall reload must never leave a running image browser without its guard.
set -eu
[ "$(id -u)" = 0 ] || exit 1
guard=/usr/local/libexec/pt-image-host-guard.sh
if "$guard" check >/dev/null 2>&1; then exit 0; fi
containers=$(docker ps -q --filter 'label=pt.image-generation.role=provider-browser') || {
  echo 'Image firewall guard missing; Docker unavailable for emergency stop' >&2
  exit 1
}
for container in $containers; do
  # Container IDs come from Docker, never from external requests or filenames.
  docker update --restart=no "$container" >/dev/null || echo 'Could not disable browser restart' >&2
  docker stop --time 0 "$container" >/dev/null || echo 'Could not stop provider browser' >&2
done
echo 'Image firewall guard missing; provider browsers stopped and restart disabled' >&2
exit 1
