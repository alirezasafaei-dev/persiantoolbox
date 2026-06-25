"""Full backup: DB + files + env + nginx + SSL."""
import os
from datetime import datetime
from rich.console import Console
from .ssh_client import run_ssh, rsync_from_vps

console = Console()
DATE = datetime.now().strftime("%Y%m%d_%H%M%S")
BACKUP_DIR = os.path.expanduser("~/my-project/backups/persiantoolbox")


def main():
    os.makedirs(BACKUP_DIR, exist_ok=True)

    console.print(f"[bold]Backup started: {DATE}[/bold]\n")

    # 1. PostgreSQL dump
    console.print("[cyan]1/6 PostgreSQL dump...[/cyan]")
    run_ssh(f"sudo -u postgres pg_dump persian_tools > /home/ubuntu/backups/persian_tools_{DATE}.sql")
    console.print("   ✓ Database dumped")

    # 2. Project files
    console.print("[cyan]2/6 Project files...[/cyan]")
    run_ssh(
        f"cd /home/ubuntu && tar czf /home/ubuntu/backups/persiantoolbox_files_{DATE}.tar.gz "
        f"--exclude='node_modules' --exclude='.next' --exclude='.git' --exclude='backups' persiantoolbox/"
    )
    console.print("   ✓ Files archived")

    # 3. Environment
    console.print("[cyan]3/6 Environment...[/cyan]")
    run_ssh(f"cp /home/ubuntu/persiantoolbox/.env /home/ubuntu/backups/env_backup_{DATE}")
    console.print("   ✓ .env saved")

    # 4. Nginx config
    console.print("[cyan]4/6 Nginx config...[/cyan]")
    run_ssh(f"sudo cp /etc/nginx/sites-enabled/projects /home/ubuntu/backups/nginx_projects_{DATE}")
    console.print("   ✓ Nginx config saved")

    # 5. SSL certificates
    console.print("[cyan]5/6 SSL certificates...[/cyan]")
    run_ssh(
        f"sudo tar czf /home/ubuntu/backups/ssl_{DATE}.tar.gz "
        f"/etc/letsencrypt/live/persiantoolbox.ir/ 2>/dev/null || true"
    )
    console.print("   ✓ SSL saved")

    # 6. PM2 state
    console.print("[cyan]6/6 PM2 state...[/cyan]")
    run_ssh("pm2 save")
    console.print("   ✓ PM2 saved")

    # Download to local
    console.print("\n[cyan]Downloading to local machine...[/cyan]")
    for name in ["persian_tools", "persiantoolbox_files", "env_backup", "nginx_projects"]:
        remote = f"/home/ubuntu/backups/{name}_{DATE}" if "persian" in name or "nginx" in name else f"/home/ubuntu/backups/{name}_{DATE}"
        if "persian_tools" in name:
            remote += ".sql"
        elif "persiantoolbox_files" in name:
            remote += ".tar.gz"
        rsync_from_vps(remote, f"{BACKUP_DIR}/")

    # Cleanup old backups (keep 7 days)
    console.print("\n[cyan]Cleaning old backups...[/cyan]")
    run_ssh(
        "find /home/ubuntu/backups -name '*.sql' -mtime +7 -delete 2>/dev/null; "
        "find /home/ubuntu/backups -name '*.tar.gz' -mtime +7 -delete 2>/dev/null; "
        "find /home/ubuntu/backups -name 'env_backup_*' -mtime +7 -delete 2>/dev/null"
    )
    console.print("   ✓ Cleanup done")

    # Summary
    result = run_ssh(f"ls -lh /home/ubuntu/backups/*_{DATE}*")
    console.print(f"\n[bold green]✓ Backup complete[/bold green]\n{result.stdout}")


if __name__ == "__main__":
    main()
