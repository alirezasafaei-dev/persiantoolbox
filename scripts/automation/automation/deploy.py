"""Compatibility wrapper for the canonical atomic production deployer."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path


def main() -> int:
    repository_root = Path(__file__).resolve().parents[3]
    command = ["bash", str(repository_root / "deploy-blue-green.sh"), *sys.argv[1:]]
    print(
        "[deploy] automation.deploy is retired; delegating to the atomic blue-green entrypoint",
        file=sys.stderr,
    )
    return subprocess.run(command, check=False).returncode


if __name__ == "__main__":
    raise SystemExit(main())
