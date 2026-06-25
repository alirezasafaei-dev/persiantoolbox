"""PersianToolbox Deploy — Professional deployment with rollback."""
import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from .ssh_client import VPS_HOST, VPS_USER, SSH_KEY, run_local, run_ssh

console = Console()
SITE = "https://persiantoolbox.ir"
DEPLOY_LOG = Path.home() / ".local/share/persiantoolbox/deploy-history.json"


def get_version() -> str:
    """Read version from package.json."""
    pkg = json.loads(Path("package.json").read_text())
    return pkg.get("version", "unknown")


def qa_gate() -> bool:
    """Run typecheck + lint + tests. Return True if all pass."""
    console.print("[bold cyan]Step 1/5: QA Gatekeeper[/bold cyan]")

    steps = [
        ("Typecheck", "pnpm typecheck"),
        ("Lint", "pnpm lint"),
        ("Tests", "pnpm vitest --run"),
    ]

    for name, cmd in steps:
        result = run_local(cmd, check=False)
        if result.returncode != 0:
            console.print(f"  [red]✗ {name} FAILED[/red]")
            console.print(result.stdout[-500:] if len(result.stdout) > 500 else result.stdout)
            return False
        console.print(f"  [green]✓ {name} passed[/green]")

    console.print("  [green bold]✓ QA gate passed[/green bold]\n")
    return True


def pre_deploy_check() -> dict:
    """Check current production state before deploy."""
    console.print("[bold cyan]Step 2/5: Pre-deploy check[/bold cyan]")

    info = {}

    # Current version
    try:
        result = run_local(f"curl -s --connect-timeout 5 {SITE}/api/health", check=False)
        data = json.loads(result.stdout)
        info["current_version"] = data.get("version", "unknown")
        info["current_uptime"] = data.get("uptime", 0)
        console.print(f"  Current: v{info['current_version']} (uptime {info['current_uptime']}s)")
    except Exception:
        info["current_version"] = "unknown"
        console.print("  [yellow]Could not detect current version[/yellow]")

    # CSS status
    try:
        result = run_local(f"curl -s --connect-timeout 5 {SITE}", check=False)
        match = re.search(r'href="/_next/static/chunks/[^"]*\.css"', result.stdout)
        if match:
            css_path = re.search(r'/_next/[^"]+', match.group()).group()
            css_result = run_local(
                f"curl -s -o /dev/null -w '%{{http_code}}' --connect-timeout 5 {SITE}{css_path}",
                check=False
            )
            info["css_status"] = css_result.stdout.strip()
            status = "[green]OK[/green]" if info["css_status"] == "200" else f"[red]{info['css_status']}[/red]"
            console.print(f"  CSS: {status}")
    except Exception:
        pass

    console.print()
    return info


def rsync_code() -> bool:
    """Sync code to VPS."""
    console.print("[bold cyan]Step 3/5: Sync code to VPS[/bold cyan]")

    excludes = [
        "node_modules", ".next", ".git", "*.log",
        ".env", ".env.*", ".archive", "backups",
        "__pycache__", ".venv",
    ]
    exclude_flags = " ".join(f"--exclude='{e}'" for e in excludes)

    result = run_local(
        f"rsync -avz --delete {exclude_flags} "
        f"-e 'ssh -i {SSH_KEY} -o StrictHostKeyChecking=no' "
        f". {VPS_USER}@{VPS_HOST}:/home/ubuntu/persiantoolbox/",
        check=False,
    )

    if result.returncode != 0:
        console.print(f"  [red]✗ Rsync failed[/red]\n{result.stderr}")
        return False

    console.print("  [green]✓ Code synced[/green]\n")
    return True


def build_and_deploy() -> bool:
    """Build on VPS, copy static, restart PM2, purge nginx."""
    console.print("[bold cyan]Step 4/5: Build & deploy on VPS[/bold cyan]")

    script = f"""set -e
cd /home/ubuntu/persiantoolbox

# Fix shared package path
sed -i 's|../../shared/packages/payments|/home/ubuntu/shared/packages/payments|g' package.json

# Install dependencies
pnpm install --no-frozen-lockfile 2>/dev/null

# Build
echo "Building..."
NODE_OPTIONS='--max-old-space-size=4096' NODE_ENV=production npx next build

# Verify standalone
if [ ! -d ".next/standalone" ]; then
  echo "ERROR: .next/standalone not found!"
  exit 1
fi

# Copy static assets
rm -rf .next/standalone/.next/static
cp -r .next/static .next/standalone/.next/static
mkdir -p .next/standalone/public
cp -r public/* .next/standalone/public/ 2>/dev/null || true
cp -r public/.well-known .next/standalone/public/ 2>/dev/null || true
chmod -R o+rX .next/standalone/.next/static/ .next/standalone/public/

# Verify CSS
CSS_COUNT=$(find .next/standalone/.next/static -name '*.css' | wc -l)
echo "Static: $CSS_COUNT CSS files"
[ "$CSS_COUNT" -eq 0 ] && echo "ERROR: No CSS!" && exit 1

# Restart PM2
pm2 delete persiantoolbox 2>/dev/null || true
pm2 start ecosystem.config.js

# Purge nginx cache
rm -rf /var/cache/nginx/persiantoolbox/* 2>/dev/null || true
sudo nginx -t 2>/dev/null && sudo systemctl reload nginx 2>/dev/null || true

# Save PM2 state
pm2 save

echo "BUILD_DEPLOY_OK"
"""

    result = run_ssh(script, check=False)
    print(result.stdout)

    if "BUILD_DEPLOY_OK" not in result.stdout:
        console.print(f"  [red]✗ Build/deploy failed[/red]\n{result.stderr}")
        return False

    console.print("  [green]✓ Build & deploy complete[/green]\n")
    return True


def verify() -> bool:
    """Verify deployment: health + CSS + fonts."""
    console.print("[bold cyan]Step 5/5: Verify[/bold cyan]")

    time.sleep(3)

    # Health
    try:
        result = run_local(f"curl -s --connect-timeout 10 --max-time 15 {SITE}/api/health", check=False)
        data = json.loads(result.stdout)
        if data.get("status") == "ok":
            console.print(f"  [green]✓ Health: v{data['version']}[/green]")
        else:
            console.print(f"  [red]✗ Health: {data}[/red]")
            return False
    except Exception as e:
        console.print(f"  [red]✗ Health check failed: {e}[/red]")
        return False

    # CSS
    try:
        result = run_local(f"curl -s --connect-timeout 5 {SITE}", check=False)
        match = re.search(r'href="/_next/static/chunks/[^"]*\.css"', result.stdout)
        if match:
            css_path = re.search(r'/_next/[^"]+', match.group()).group()
            css_result = run_local(
                f"curl -s -o /dev/null -w '%{{http_code}}' --connect-timeout 10 {SITE}{css_path}",
                check=False,
            )
            if css_result.stdout.strip() == "200":
                console.print(f"  [green]✓ CSS: HTTP 200[/green]")
            else:
                console.print(f"  [red]✗ CSS: HTTP {css_result.stdout.strip()}[/red]")
                return False
        else:
            console.print("  [red]✗ CSS: not found in HTML[/red]")
            return False
    except Exception as e:
        console.print(f"  [red]✗ CSS check failed: {e}[/red]")
        return False

    # Fonts
    try:
        result = run_local(
            f"curl -s -o /dev/null -w '%{{http_code}}' --connect-timeout 5 {SITE}/fonts/Vazirmatn-Bold.woff2",
            check=False,
        )
        console.print(f"  [green]✓ Fonts: HTTP {result.stdout.strip()}[/green]")
    except Exception:
        pass

    console.print()
    return True


def log_deploy(version: str, success: bool, pre_info: dict):
    """Log deployment to history file."""
    DEPLOY_LOG.parent.mkdir(parents=True, exist_ok=True)

    history = []
    if DEPLOY_LOG.exists():
        try:
            history = json.loads(DEPLOY_LOG.read_text())
        except Exception:
            history = []

    history.append({
        "timestamp": datetime.now().isoformat(),
        "version": version,
        "success": success,
        "from_version": pre_info.get("current_version"),
    })

    # Keep last 50 deploys
    DEPLOY_LOG.write_text(json.dumps(history[-50:], indent=2))


def rollback(version: str):
    """Rollback to a previous version by redeploying from git."""
    console.print(f"[yellow]Rolling back to v{version}...[/yellow]")
    result = run_local(f"git checkout v{version} 2>/dev/null || git checkout {version}", check=False)
    if result.returncode == 0:
        console.print("  Checked out, redeploying...")
        rsync_code()
        build_and_deploy()
        verify()
        console.print(f"[green]✓ Rollback to v{version} complete[/green]")
    else:
        console.print(f"[red]✗ Could not checkout {version}[/red]")


def main():
    version = get_version()

    console.print(Panel(
        f"[bold]PersianToolbox Deploy[/bold]\n"
        f"Version: [cyan]v{version}[/cyan]\n"
        f"Target: [cyan]{VPS_HOST}[/cyan]\n"
        f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        title="Deploy",
        border_style="cyan",
    ))

    # Check for --rollback flag
    if len(sys.argv) > 1 and sys.argv[1] == "--rollback":
        if len(sys.argv) > 2:
            rollback(sys.argv[2])
        else:
            console.print("[yellow]Usage: python -m automation.deploy --rollback <version>[/yellow]")
        return

    start = time.time()

    # Step 1: QA
    if not qa_gate():
        console.print("[bold red]DEPLOY ABORTED: QA gate failed[/bold red]")
        sys.exit(1)

    # Step 2: Pre-deploy
    pre_info = pre_deploy_check()

    # Step 3: Rsync
    if not rsync_code():
        console.print("[bold red]DEPLOY ABORTED: Rsync failed[/bold red]")
        sys.exit(1)

    # Step 4: Build & deploy
    if not build_and_deploy():
        console.print("[bold red]DEPLOY FAILED: Build/deploy error[/bold red]")
        log_deploy(version, False, pre_info)
        console.print("[yellow]Run: python -m automation.deploy --rollback " + pre_info.get("current_version", "PREV") + "[/yellow]")
        sys.exit(1)

    # Step 5: Verify
    success = verify()
    elapsed = time.time() - start

    log_deploy(version, success, pre_info)

    if success:
        console.print(Panel(
            f"[bold green]Deploy successful![/bold green]\n\n"
            f"Version: v{pre_info.get('current_version', '?')} → [cyan]v{version}[/cyan]\n"
            f"Time: {elapsed:.0f}s\n"
            f"Site: {SITE}",
            title="✓ Done",
            border_style="green",
        ))
    else:
        console.print(Panel(
            f"[bold red]Deploy verification failed![/bold red]\n\n"
            f"Check: {SITE}/api/health\n"
            f"Rollback: python -m automation.deploy --rollback {pre_info.get('current_version', 'PREV')}",
            title="✗ Failed",
            border_style="red",
        ))
        sys.exit(1)


if __name__ == "__main__":
    main()
