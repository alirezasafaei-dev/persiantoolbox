#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST_DIR="$HOME/.config/systemd/user"

mkdir -p "$DEST_DIR"

cp "$SCRIPT_DIR/asdev-uptime-check.service" "$DEST_DIR/"
cp "$SCRIPT_DIR/asdev-uptime-check.timer" "$DEST_DIR/"

systemctl --user daemon-reload
systemctl --user enable --now asdev-uptime-check.timer

echo "Uptime monitor installed and started."
echo "Check status: systemctl --user status asdev-uptime-check.timer"
echo "View logs:    journalctl --user -u asdev-uptime-check.service -f"
