"""Full backup: DB + files + env + nginx + SSL + PM2."""
import os
import subprocess
from datetime import datetime
from pathlib import Path
from rich.console import Console
from rich.table import Table
from .ssh_client import VPS_HOST, VPS_USER, SSH_KEY, run_ssh

console = Console()
DATE = datetime.now().strftime("%Y%m%d_%H%M%S")
BACKUP_DIR = Path.home() / "my-project/backups/persiantoolbox"
VPS_BACKUP = "/home/ubuntu/backups"


def main():
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    console.print(f"[bold]Backup started: {DATE}[/bold]\n")

    backups = []

    # 1. PostgreSQL
    console.print("[cyan]1/6 PostgreSQL...[/cyan]")
    run_ssh(f"sudo -u postgres pg_dump persian_tools > {VPS_BACKUP}/persian_tools_{DATE}.sql")
    console.print("   ✓ Database dumped")
    backups.append(f"persian_tools_{DATE}.sql")

    # 2. Files
    console.print("[cyan]2/6 Project files...[/cyan]")
    run_ssh(
        f"cd /home/ubuntu && tar czf {VPS_BACKUP}/persiantoolbox_files_{DATE}.tar.gz "
        f"--exclude='node_modules' --exclude='.next' --exclude='.git' --exclude='backups' "
        f"--exclude='__pycache__' --exclude='.venv' persiantoolbox/"
    )
    console.print("   ✓ Files archived")
    backups.append(f"persiantoolbox_files_{DATE}.tar.gz")

    # 3. Environment
    console.print("[cyan]3/6 Environment...[/cyan]")
    run_ssh(f"cp /home/ubuntu/persiantoolbox/.env {VPS_BACKUP}/env_backup_{DATE}")
    console.print("   ✓ .env saved")
    backups.append(f"env_backup_{DATE}")

    # 4. Nginx
    console.print("[cyan]4/6 Nginx config...[/cyan]")
    run_ssh(f"sudo cp /etc/nginx/sites-enabled/projects {VPS_BACKUP}/nginx_projects_{DATE}")
    console.print("   ✓ Nginx saved")
    backups.append(f"nginx_projects_{DATE}")

    # 5. SSL
    console.print("[cyan]5/6 SSL certificates...[/cyan]")
    run_ssh(f"sudo tar czf {VPS_BACKUP}/ssl_{DATE}.tar.gz /etc/letsencrypt/live/persiantoolbox.ir/ 2>/dev/null || true")
    console.print("   ✓ SSL saved")
    backups.append(f"ssl_{DATE}.tar.gz")

    # 6. PM2
    console.print("[cyan]6/6 PM2 state...[/cyan]")
    run_ssh("pm2 save")
    console.print("   ✓ PM2 saved")

    # Download to local
    console.print("\n[cyan]Downloading to local...[/cyan]")
    for name in backups:
        remote = f"{VPS_BACKUP}/{name}"
        local = str(BACKUP_DIR / name)
        cmd = [
            "rsync", "-e", f"ssh -i {SSH_KEY} -o StrictHostKeyChecking=no",
            f"{VPS_USER}@{VPS_HOST}:{remote}", local,
        ]
        subprocess.run(cmd, capture_output=True, text=True)
    console.print("   ✓ Downloaded")

    # Cleanup (keep 7 days)
    console.print("\n[cyan]Cleaning old backups...[/cyan]")
    run_ssh(
        f"find {VPS_BACKUP} -name '*.sql' -mtime +7 -delete 2>/dev/null; "
        f"find {VPS_BACKUP} -name '*.tar.gz' -mtime +7 -delete 2>/dev/null; "
        f"find {VPS_BACKUP} -name 'env_backup_*' -mtime +7 -delete 2>/dev/null"
    )
    console.print("   ✓ Cleanup done")

    # Summary
    result = run_ssh(f"ls -lh {VPS_BACKUP}/*_{DATE}*")
    console.print(f"\n[bold green]✓ Backup complete[/bold green]\n")
    console.print(result.stdout)


if __name__ == "__main__":
    main()
