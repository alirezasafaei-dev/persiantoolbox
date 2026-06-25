"""Graceful VPS shutdown for maintenance."""
from rich.console import Console
from .backup import main as backup
from .ssh_client import run_ssh

console = Console()


def main():
    console.print("[bold]VPS Graceful Shutdown[/bold]\n")

    # 1. Backup
    console.print("[cyan]Step 1: Creating backup...[/cyan]")
    backup()
    console.print()

    # 2. Stop services
    console.print("[cyan]Step 2: Stopping services...[/cyan]")
    run_ssh("pm2 save")
    console.print("   ✓ PM2 state saved")

    run_ssh("pm2 stop all")
    console.print("   ✓ PM2 processes stopped")

    run_ssh("sudo systemctl stop postgresql")
    console.print("   ✓ PostgreSQL stopped")

    run_ssh("sudo systemctl stop redis-server")
    console.print("   ✓ Redis stopped")

    console.print("\n[bold green]✓ VPS ready for shutdown[/bold green]")
    console.print("[yellow]After maintenance, run: python -m automation.startup[/yellow]")


if __name__ == "__main__":
    main()
