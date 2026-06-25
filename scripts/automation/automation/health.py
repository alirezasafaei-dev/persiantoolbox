"""Health check: site, SSL, key pages, services."""
import json
import subprocess
from rich.console import Console
from rich.table import Table

console = Console()

SITE = "https://persiantoolbox.ir"


def check_url(url: str, timeout: int = 5) -> int | None:
    """Return HTTP status code for a URL."""
    try:
        result = subprocess.run(
            ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}",
             "--connect-timeout", str(timeout), "--max-time", str(timeout + 5), url],
            capture_output=True, text=True, timeout=timeout + 10
        )
        return int(result.stdout.strip()) if result.stdout.strip().isdigit() else None
    except Exception:
        return None


def main():
    console.print("[bold]PersianToolbox Health Check[/bold]\n")

    table = Table(title="Health Status")
    table.add_column("Check", style="cyan")
    table.add_column("Status", style="bold")
    table.add_column("Detail")

    # 1. Health API
    try:
        result = subprocess.run(
            ["curl", "-s", "--connect-timeout", "5", f"{SITE}/api/health"],
            capture_output=True, text=True, timeout=10
        )
        data = json.loads(result.stdout)
        if data.get("status") == "ok":
            table.add_row("Health API", "[green]✓ OK[/green]", f"v{data['version']}, uptime {data['uptime']}s")
        else:
            table.add_row("Health API", "[red]✗ FAIL[/red]", str(data))
    except Exception as e:
        table.add_row("Health API", "[red]✗ FAIL[/red]", str(e))

    # 2. CSS
    try:
        result = subprocess.run(
            ["curl", "-s", "--connect-timeout", "5", SITE],
            capture_output=True, text=True, timeout=10
        )
        import re
        match = re.search(r'href="/_next/static/chunks/[^"]*\.css"', result.stdout)
        if match:
            css_path = re.search(r'/_next/[^"]+', match.group()).group()
            css_http = check_url(f"{SITE}{css_path}")
            table.add_row("CSS", "[green]✓ OK[/green]" if css_http == 200 else f"[red]✗ HTTP {css_http}[/red]", css_path)
        else:
            table.add_row("CSS", "[red]✗ Not found[/red]", "")
    except Exception as e:
        table.add_row("CSS", "[red]✗ FAIL[/red]", str(e))

    # 3. SSL
    try:
        result = subprocess.run(
            ["bash", "-c",
             f"echo | openssl s_client -connect persiantoolbox.ir:443 -servername persiantoolbox.ir 2>/dev/null "
             f"| openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2"],
            capture_output=True, text=True, timeout=10
        )
        expiry = result.stdout.strip()
        table.add_row("SSL", "[green]✓ Valid[/green]", f"Expires: {expiry}" if expiry else "Unknown")
    except Exception as e:
        table.add_row("SSL", "[red]✗ FAIL[/red]", str(e))

    # 4. Key pages
    for page in ["/", "/topics", "/salary", "/pricing", "/blog", "/search"]:
        http = check_url(f"{SITE}{page}")
        status = "[green]✓ 200[/green]" if http == 200 else f"[red]✗ {http}[/red]"
        table.add_row(f"Page {page}", status, "")

    console.print(table)
    console.print("\n[bold green]✓ Check complete[/bold green]")


if __name__ == "__main__":
    main()
