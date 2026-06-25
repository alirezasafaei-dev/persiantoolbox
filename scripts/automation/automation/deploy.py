"""One-command deploy: backup + build + deploy + verify."""
from rich.console import Console
from .backup import main as backup
from .health import main as health_check
from .ssh_client import run_local

console = Console()


def main():
    console.print("[bold]PersianToolbox Deploy[/bold]\n")

    # Step 1: Backup
    console.print("[bold cyan]Step 1: Backup[/bold cyan]")
    backup()
    console.print()

    # Step 2: Deploy
    console.print("[bold cyan]Step 2: Deploy[/bold cyan]")
    result = run_local("bash deploy-vps-auto.sh", check=False)
    print(result.stdout)
    if result.returncode != 0:
        console.print("[red]Deploy failed![/red]")
        print(result.stderr)
        return

    # Step 3: Verify
    console.print("[bold cyan]Step 3: Verify[/bold cyan]")
    health_check()

    console.print("\n[bold green]✓ Deploy complete![/bold green]")


if __name__ == "__main__":
    main()
