#!/usr/bin/env bash
set -Eeuo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"

printf '%s\n' \
  'This compatibility entrypoint now uses the gated OpenClaw installer.' \
  'It does not create credentials or placeholder environment files.'

exec "${script_dir}/install-hetzner-openclaw.sh" "$@"
