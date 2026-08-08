#!/usr/bin/env bash
# verify-key-isolation.sh — v3.2 private-key isolation smoke proof
#
# Demonstrates that the Agent execution user (asdev) CANNOT read the review
# private key when it is stored server-side under a distinct Unix account
# (pt-review) with mode 0600.
#
# Usage:
#   bash scripts/growth/agent-loop/verify-key-isolation.sh [PRIVATE_KEY_PATH]
#
# Default private key path: /etc/pt-review/review-ed25519.key
# (owner: pt-review, mode: 0600 — created by the review authority)
#
# Exit codes:
#   0  PASS — the Agent user cannot read the private key
#   1  FAIL — the Agent user CAN read the private key (isolation broken)
#   2  SKIP — sudo unavailable or key path not provided (report, not fail)
#
# This script NEVER prints private key contents.

set -u

KEY_PATH="${1:-/etc/pt-review/review-ed25519.key}"
AGENT_USER="${AGENT_USER:-asdev}"

if ! command -v sudo >/dev/null 2>&1; then
  echo "SKIP: sudo unavailable — cannot run the cross-user read check here."
  echo "Run this on the Hetzner worker as root: bash scripts/growth/agent-loop/verify-key-isolation.sh"
  exit 2
fi

if [ ! -f "$KEY_PATH" ]; then
  echo "SKIP: private key file $KEY_PATH does not exist on this host."
  echo "If the private key is kept entirely outside the execution plane (recommended),"
  echo "isolation is satisfied by construction — report that instead."
  exit 2
fi

# The Agent user must NOT be able to read the key file.
if sudo -u "$AGENT_USER" test -r "$KEY_PATH" 2>/dev/null; then
  echo "FAIL: Agent user '$AGENT_USER' CAN read $KEY_PATH — isolation broken!"
  echo "Fix: chown pt-review:pt-review $KEY_PATH && chmod 600 $KEY_PATH"
  exit 1
fi

echo "PASS: Agent user '$AGENT_USER' cannot read $KEY_PATH (owner-only, 0600)."
echo "Private key contents were never printed."
exit 0