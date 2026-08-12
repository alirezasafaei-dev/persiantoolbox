#!/usr/bin/env bash
set -Eeuo pipefail

fail() { printf 'FAIL: %s\n' "$*" >&2; exit 1; }
gateway_started=0
cleanup_failed_gateway() {
  [[ "$gateway_started" -eq 1 ]] || return 0
  systemctl --user disable --now openclaw-gateway.service >/dev/null 2>&1 || true
}
trap cleanup_failed_gateway ERR

[[ "$(id -u)" -ne 0 ]] || fail "run as the dedicated automation user, not root"
[[ -n "${OPENCLAW_VERSION:-}" ]] || fail "set OPENCLAW_VERSION to a reviewed stable version"
[[ -n "${CODEX_VERSION:-}" ]] || fail "set CODEX_VERSION to a reviewed stable version"
export PATH="${HOME}/.local/bin:${PATH}"

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
"${script_dir}/preflight-hetzner-control-plane.sh" | tee /tmp/persiantoolbox-control-preflight.log
grep -qx 'PREFLIGHT_OK' /tmp/persiantoolbox-control-preflight.log \
  || fail "preflight did not complete"

install_root="${HOME}/.local"
repo_root="${HOME}/persiantoolbox-control"
mkdir -p "$install_root" "${HOME}/.config/persiantoolbox-control"
chmod 700 "${HOME}/.config/persiantoolbox-control"

npm install --global --prefix "$install_root" --allow-scripts=openclaw \
  "openclaw@${OPENCLAW_VERSION}" \
  "@openai/codex@${CODEX_VERSION}"
export PATH="${install_root}/bin:${PATH}"

if [[ ! -d "${repo_root}/.git" ]]; then
  git clone --branch codex/agent-control-plane --single-branch \
    https://github.com/alirezasafaei-dev/persiantoolbox.git "$repo_root"
else
  git -C "$repo_root" fetch --prune origin
  git -C "$repo_root" switch codex/agent-control-plane
  git -C "$repo_root" pull --ff-only origin codex/agent-control-plane
fi

git -C "$repo_root" status --porcelain | grep -q . \
  && fail "control-plane checkout is not clean"

(cd "$repo_root" && corepack pnpm install --frozen-lockfile)

command -v gh >/dev/null || fail "GitHub CLI is required"
gh auth status >/dev/null || fail "GitHub CLI authentication is required"
codex --version

gateway_token="$(openssl rand -hex 32)"
openclaw onboard --non-interactive --accept-risk --install-daemon \
  --gateway-bind loopback --gateway-auth token --token "$gateway_token" \
  --skip-channels --skip-skills --skip-bootstrap --skip-search --skip-health --skip-ui --skip-hooks
gateway_started=1
[[ "$(openclaw config get gateway.bind)" == "loopback" ]] \
  || fail "gateway.bind must remain loopback"
gateway_auth_mode="$(openclaw config get gateway.auth.mode)"
[[ "$gateway_auth_mode" == "token" || "$gateway_auth_mode" == "password" ]] \
  || fail "gateway.auth.mode must be token or password"
gateway_auth_value="$(openclaw config get "gateway.auth.${gateway_auth_mode}" 2>/dev/null || true)"
[[ -n "$gateway_auth_value" && "$gateway_auth_value" != "undefined" && "$gateway_auth_value" != "null" ]] \
  || fail "gateway authentication credential is missing"
telegram_config="$(openclaw config get channels.telegram 2>/dev/null || true)"
[[ -z "$telegram_config" || "$telegram_config" == "undefined" || "$telegram_config" == "null" || "$telegram_config" == "{}" ]] \
  || fail "Telegram must remain unconfigured; Hermes owns Telegram polling"
openclaw gateway status --deep --require-rpc
systemctl --user is-enabled openclaw-gateway.service >/dev/null
systemctl --user is-active openclaw-gateway.service >/dev/null

unit_dir="${HOME}/.config/systemd/user"
mkdir -p "$unit_dir"
cat > "${unit_dir}/persiantoolbox-agent-loop.service" <<UNIT
[Unit]
Description=PersianToolbox canonical GitHub mission poller
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=${repo_root}
ExecStart=${install_root}/bin/corepack pnpm exec tsx scripts/growth/agent-loop/index.ts poll --interval 180000
Restart=always
RestartSec=30
Environment=PATH=${install_root}/bin:/usr/local/bin:/usr/bin:/bin

[Install]
WantedBy=default.target
UNIT
systemctl --user daemon-reload
systemctl --user enable --now persiantoolbox-agent-loop.service
systemctl --user is-enabled persiantoolbox-agent-loop.service >/dev/null
systemctl --user is-active persiantoolbox-agent-loop.service >/dev/null
systemctl --user show persiantoolbox-agent-loop.service -p ExecStart --value | grep -F 'index.ts poll --interval 180000' >/dev/null \
  || fail "canonical poller ExecStart verification failed"

codex exec --sandbox workspace-write \
  --cwd "$repo_root" \
  "Read AGENTS.md and report the current control-plane branch, state, and next eligible mission. Make no changes."

trap - ERR
printf 'INSTALL_OK\n'
