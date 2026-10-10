#!/bin/sh
# Host-side guard for the two dedicated image-browser bridges. Never flush rules.
set -eu
mode=${1:-check}
case "$mode" in apply|check) ;; *) echo 'Usage: host-egress-guard.sh [apply|check]' >&2; exit 2 ;; esac
[ "$#" -le 1 ] || exit 2
[ "$(id -u)" = 0 ] || { echo 'Host firewall verification requires root' >&2; exit 1; }
chain=PT_IMAGE_HOST_GUARD
for firewall in iptables ip6tables; do
  command -v "$firewall" >/dev/null || { echo 'Required host firewall tool unavailable' >&2; exit 1; }
  if [ "$mode" = apply ]; then
    if ! "$firewall" -w 5 -S "$chain" >/dev/null 2>&1; then
      "$firewall" -w 5 -N "$chain"
    fi
    "$firewall" -w 5 -S "$chain" | while IFS= read -r rule; do
      case "$rule" in
        "-N $chain"|"-A $chain -i ptimg-control -j DROP"|"-A $chain -i ptimg-egress -j DROP") ;;
        *) echo 'Unexpected rules in dedicated image guard chain; refusing mutation' >&2; exit 1 ;;
      esac
    done
    for bridge in ptimg-control ptimg-egress; do
      if ! "$firewall" -w 5 -C "$chain" -i "$bridge" -j DROP 2>/dev/null; then
        "$firewall" -w 5 -I "$chain" 1 -i "$bridge" -j DROP
      fi
    done
    first=$("$firewall" -w 5 -S INPUT | awk '/^-A INPUT / {print; exit}')
    if [ "$first" != "-A INPUT -j $chain" ]; then
      "$firewall" -w 5 -I INPUT 1 -j "$chain"
    fi
  fi
  for bridge in ptimg-control ptimg-egress; do
    "$firewall" -w 5 -C "$chain" -i "$bridge" -j DROP >/dev/null
  done
  "$firewall" -w 5 -S "$chain" | while IFS= read -r rule; do
    case "$rule" in
      "-N $chain"|"-A $chain -i ptimg-control -j DROP"|"-A $chain -i ptimg-egress -j DROP") ;;
      *) echo 'Unexpected image guard rule detected' >&2; exit 1 ;;
    esac
  done
  first=$("$firewall" -w 5 -S INPUT | awk '/^-A INPUT / {print; exit}')
  [ "$first" = "-A INPUT -j $chain" ] || { echo 'Image guard must precede host INPUT accepts' >&2; exit 1; }
done
echo 'Image host egress guard verified for IPv4 and IPv6'
