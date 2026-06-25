"""Server health check (run via SSH on VPS)."""
from rich.console import Console
from rich.table import Table
from .ssh_client import run_ssh

console = Console()


def main():
    console.print("[bold]VPS Server Health[/bold]\n")

    table = Table(title="Services")
    table.add_column("Service", style="cyan")
    table.add_column("Status", style="bold")
    table.add_column("Detail")

    # PM2
    result = run_ssh("pm2 jlist 2>/dev/null", check=False)
    try:
        import json
        processes = json.loads(result.stdout)
        for p in processes:
            name = p.get("name", "?")
            status = p.get("pm2_env", {}).get("status", "?")
            version = p.get("pm2_env", {}).get("version", "?")
            style = "[green]" if status == "online" else "[red]"
            table.add_row(f"PM2: {name}", f"{style}{status}[/]", f"v{version}")
    except Exception:
        table.add_row("PM2", "[red]✗ Error[/red]", "")

    # PostgreSQL
    result = run_ssh("pg_isready 2>/dev/null && echo OK || echo FAIL", check=False)
    pg_status = "✓ OK" if "OK" in result.stdout else "✗ FAIL"
    table.add_row("PostgreSQL", f"[green]{pg_status}[/green]" if "OK" in pg_status else f"[red]{pg_status}[/red]", "")

    # Redis
    result = run_ssh("redis-cli ping 2>/dev/null", check=False)
    redis_status = "✓ PONG" if "PONG" in result.stdout else "✗ FAIL"
    table.add_row("Redis", f"[green]{redis_status}[/green]" if "PONG" in redis_status else f"[red]{redis_status}[/red]", "")

    # Disk
    result = run_ssh("df -h / | tail -1 | awk '{print $5}'", check=False)
    table.add_row("Disk", "[bold]" + result.stdout.strip() + "[/bold]", "")

    # Memory
    result = run_ssh("free -h | awk '/^Mem:/{print $3\"/\"$2}'", check=False)
    table.add_row("Memory", "[bold]" + result.stdout.strip() + "[/bold]", "")

    # Uptime
    result = run_ssh("uptime -p", check=False)
    table.add_row("Uptime", result.stdout.strip(), "")

    # fail2ban
    result = run_ssh("sudo fail2ban-client status sshd 2>/dev/null | grep 'Currently banned' | awk '{print $NF}'", check=False)
    banned = result.stdout.strip()
    table.add_row("fail2ban", f"{banned} IP(s) banned", "")

    # Health endpoint
    result = run_ssh("curl -s http://localhost:3000/api/health 2>/dev/null | head -1", check=False)
    if result.stdout.strip():
        table.add_row("App", "[green]✓ Responding[/green]", "")
    else:
        table.add_row("App", "[red]✗ Not responding[/red]", "")

    console.print(table)
    console.print("\n[bold green]✓ Check complete[/bold green]")


if __name__ == "__main__":
    main()
