"""Start services after maintenance."""
from rich.console import Console
from .ssh_client import run_ssh
from .health import main as health_check

console = Console()


def main():
    console.print("[bold]VPS Startup[/bold]\n")

    console.print("[cyan]Starting services...[/cyan]")
    run_ssh("sudo systemctl start redis-server")
    console.print("   ✓ Redis started")

    run_ssh("sudo systemctl start postgresql")
    console.print("   ✓ PostgreSQL started")

    run_ssh("pm2 resurrect 2>/dev/null || pm2 start ecosystem.config.js")
    console.print("   ✓ PM2 started")

    console.print("\n[cyan]Waiting for app...[/cyan]")
    import time
    time.sleep(5)

    console.print("\n[cyan]Running health check...[/cyan]")
    health_check()

    console.print("\n[bold green]✓ VPS is back online[/bold green]")


if __name__ == "__main__":
    main()
