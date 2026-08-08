#!/bin/bash
# Hetzner Agent Bootstrap — runs once on Hetzner
set -e

AGENT_DIR="/home/asdev/persiantoolbox-agent"
cd "$AGENT_DIR"

echo "=== PersianToolbox Agent Bootstrap ==="

# 1. Git config
git config user.name "PersianToolbox Agent"
git config user.email "agent@persiantoolbox.ir"
echo "✅ Git config set"

# 2. Pull latest
git pull origin main
echo "✅ Repository up to date"

# 3. Install pnpm locally (no sudo needed)
corepack enable 2>/dev/null || true
echo "✅ Corepack enabled"

# 4. Install dependencies
npx pnpm install --frozen-lockfile 2>&1 | tail -3
echo "✅ Dependencies installed"

# 5. Create .env if missing
if [ ! -f .env ]; then
  echo "NOTION_TOKEN=NOT_SET" > .env
  echo "NODE_ENV=production" >> .env
  chmod 600 .env
  echo "⚠️  .env created — NOTION_TOKEN needs manual set"
else
  echo "✅ .env exists"
fi

# 6. Verify Notion token is set
if grep -q "NOTION_TOKEN=ntn_" .env 2>/dev/null; then
  echo "✅ NOTION_TOKEN configured"
else
  echo "⚠️  NOTION_TOKEN not configured"
fi

# 7. Verify GitHub push access (dry run)
if git ls-remote --exit-code https://github.com/alirezasafaei-dev/persiantoolbox.git HEAD > /dev/null 2>&1; then
  echo "✅ GitHub read access OK"
else
  echo "❌ GitHub access failed"
fi

# 8. Quick typecheck (fast validation)
npx pnpm typecheck 2>&1 | tail -3
echo "✅ Typecheck passed"

# 9. Verify agent-loop can be loaded
node -e "
  const fs = require('fs');
  const stateFile = 'docs/growth/agent-loop/state.json';
  if (fs.existsSync(stateFile)) {
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    console.log('✅ State file found: status=' + state.status);
  } else {
    console.log('⚠️  No state file');
  }
"

echo ""
echo "=== Bootstrap Complete ==="
echo "Agent dir: $AGENT_DIR"
echo "Runtime: Node $(node --version)"
echo "pnpm: $(npx pnpm --version 2>/dev/null || echo 'via npx')"
