"""Shared SSH client for VPS operations."""
import subprocess
import os

VPS_HOST = "193.93.169.32"
VPS_USER = "ubuntu"
SSH_KEY = os.path.expanduser("~/.ssh/id_ed25519")


def run_local(cmd: str, check: bool = True) -> subprocess.CompletedProcess:
    """Run a local shell command."""
    return subprocess.run(
        cmd, shell=True, capture_output=True, text=True, check=check
    )


def run_ssh(cmd: str, check: bool = False) -> subprocess.CompletedProcess:
    """Run a command on VPS via SSH."""
    ssh_cmd = [
        "ssh", "-i", SSH_KEY, "-o", "StrictHostKeyChecking=no",
        f"{VPS_USER}@{VPS_HOST}", cmd,
    ]
    return subprocess.run(ssh_cmd, capture_output=True, text=True, check=check)


def run_ssh_script(script: str, check: bool = True) -> subprocess.CompletedProcess:
    """Run a multi-line script on VPS via SSH heredoc."""
    return run_ssh(f"bash -s <<'REMOTE'\n{script}\nREMOTE", check=check)


def rsync_to_vps(local_path: str, remote_path: str) -> subprocess.CompletedProcess:
    """rsync a file to VPS."""
    cmd = [
        "rsync", "-e", f"ssh -i {SSH_KEY} -o StrictHostKeyChecking=no",
        local_path, f"{VPS_USER}@{VPS_HOST}:{remote_path}",
    ]
    return subprocess.run(cmd, capture_output=True, text=True, check=True)


def rsync_from_vps(remote_path: str, local_path: str) -> subprocess.CompletedProcess:
    """rsync a file from VPS."""
    cmd = [
        "rsync", "-e", f"ssh -i {SSH_KEY} -o StrictHostKeyChecking=no",
        f"{VPS_USER}@{VPS_HOST}:{remote_path}", local_path,
    ]
    return subprocess.run(cmd, capture_output=True, text=True, check=True)
