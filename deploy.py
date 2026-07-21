#!/usr/bin/env python3
"""Compatibility wrapper for the canonical atomic production deployer."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path


def main() -> int:
    root = Path(__file__).resolve().parent
    command = ["bash", str(root / "deploy-blue-green.sh"), *sys.argv[1:]]
    print("[deploy] deploy.py is retired; delegating to deploy-blue-green.sh", file=sys.stderr)
    return subprocess.run(command, check=False).returncode


if __name__ == "__main__":
    raise SystemExit(main())
