#!/usr/bin/env bash
set -Eeuo pipefail

fail() { printf 'FAIL: %s\n' "$*" >&2; exit 1; }

[[ "$(id -u)" -ne 0 ]] || fail "run as the dedicated automation user, not root"
[[ -n "${OPENCLAW_VERSION:-}" ]] || fail "set OPENCLAW_VERSION to a reviewed stable version"
[[ -n "${CODEX_VERSION:-}" ]] || fail "set CODEX_VERSION to a reviewed stable version"

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
"${script_dir}/preflight-hetzner-control-plane.sh" | tee /tmp/persiantoolbox-control-preflight.log
grep -qx 'PREFLIGHT_OK' /tmp/persiantoolbox-control-preflight.log \
  || fail "preflight did not complete"

install_root="${HOME}/.local"
repo_root="${HOME}/persiantoolbox-control"
mkdir -p "$install_root" "${HOME}/.config/persiantoolbox-control"
chmod 700 "${HOME}/.config/persiantoolbox-control"

npm_args=(install --prefix "$install_root")
if [[ "$(npm --version | cut -d. -f1)" -ge 12 ]]; then
  npm_args+=(--allow-scripts openclaw)
fi
npm "${npm_args[@]}" \
  "openclaw@${OPENCLAW_VERSION}" \
  "@openai/codex@${CODEX_VERSION}"
export PATH="${install_root}/node_modules/.bin:${PATH}"

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

command -v gh >/dev/null || fail "GitHub CLI is required"
gh auth status >/dev/null || fail "GitHub CLI authentication is required"
codex --version

openclaw onboard --install-daemon
[[ "$(openclaw config get gateway.bind)" == "loopback" ]] \
  || fail "gateway.bind must remain loopback"
openclaw gateway status --deep --require-rpc
systemctl --user is-enabled openclaw-gateway.service >/dev/null
systemctl --user is-active openclaw-gateway.service >/dev/null
[[ "$(loginctl show-user "$USER" -p Linger --value)" == "yes" ]] \
  || fail "enable persistence with: sudo loginctl enable-linger $USER"

codex exec --sandbox workspace-write \
  --cwd "$repo_root" \
  "Read AGENTS.md and report the current control-plane branch, state, and next eligible mission. Make no changes."

printf 'INSTALL_OK\n'
