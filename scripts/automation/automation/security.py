"""Security audit: SSH, fail2ban, UFW, SSL, ports."""
from rich.console import Console
from rich.table import Table
from .ssh_client import run_ssh

console = Console()


def main():
    console.print("[bold]Security Audit[/bold]\n")

    # 1. SSH config
    console.print("[cyan]1. SSH Configuration[/cyan]")
    result = run_ssh("grep -E '^PasswordAuthentication|^PubkeyAuthentication|^MaxAuthTries|^X11Forwarding|^PermitEmptyPasswords' /etc/ssh/sshd_config")
    if not result.stdout.strip():
        result = run_ssh("grep -E 'PasswordAuthentication|PubkeyAuthentication' /etc/ssh/sshd_config.d/*.conf 2>/dev/null")
    table = Table(show_header=False)
    table.add_column("Setting", style="cyan")
    table.add_column("Value")
    for line in result.stdout.strip().split("\n"):
        if "=" in line:
            key, val = line.split("=", 1)
            style = "[green]" if val.strip() in ("no", "yes") else ""
            table.add_row(key.strip(), f"{style}{val.strip()}[/green]" if val.strip() == "no" and "password" in key else val.strip())
    console.print(table)

    # 2. fail2ban
    console.print("\n[cyan]2. fail2ban[/cyan]")
    result = run_ssh("sudo fail2ban-client status sshd 2>/dev/null | grep -E 'Currently|Total|Banned'")
    for line in result.stdout.strip().split("\n"):
        console.print(f"   {line.strip()}")

    # 3. UFW
    console.print("\n[cyan]3. UFW Firewall[/cyan]")
    result = run_ssh("sudo ufw status | grep -E '22|80|443'")
    console.print(result.stdout)

    # 4. Open ports
    console.print("[cyan]4. Open Ports (external)[/cyan]")
    result = run_ssh("ss -tlnp 2>/dev/null | grep -v '127.0.0'")
    for line in result.stdout.strip().split("\n"):
        parts = line.split()
        if len(parts) >= 4:
            console.print(f"   {parts[3]} {parts[5] if len(parts) > 5 else ''}")

    # 5. Failed SSH
    console.print("\n[cyan]5. Failed SSH (24h)[/cyan]")
    result = run_ssh("sudo journalctl -u ssh --since '24 hours ago' 2>/dev/null | grep -c 'Failed'")
    count = result.stdout.strip()
    console.print(f"   {count} failed attempts")

    # 6. SSL
    console.print("\n[cyan]6. SSL Certificate[/cyan]")
    result = run_ssh("echo | openssl s_client -connect persiantoolbox.ir:443 -servername persiantoolbox.ir 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2")
    expiry = result.stdout.strip()
    if expiry:
        console.print(f"   Expires: {expiry}")
    else:
        console.print("   Could not check")

    # 7. Disk
    console.print("\n[cyan]7. Disk Usage[/cyan]")
    result = run_ssh("df -h / | tail -1")
    console.print(f"   {result.stdout.strip()}")

    console.print("\n[bold green]✓ Audit complete[/bold green]")


if __name__ == "__main__":
    main()
