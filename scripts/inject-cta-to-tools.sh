#!/bin/bash
# Script to inject PortfolioCTA into all tool pages
# This script adds the CTA component after the main tool component

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo "=== CTA Injection Script ==="
echo "Project directory: $PROJECT_DIR"
echo ""

# Find all tool pages (excluding category pages and special pages)
TOOL_PAGES=$(find app -name "page.tsx" -path "*/(tools)/*" | \
  grep -v "app/(tools)/tools/page.tsx" | \
  grep -v "app/(tools)/premium" | \
  grep -v "app/(tools)/subscription" | \
  grep -v "app/(tools)/validation-tools/page.tsx" | \
  grep -v "app/(tools)/pdf-tools/page.tsx" | \
  grep -v "app/(tools)/text-tools/page.tsx" | \
  grep -v "app/(tools)/image-tools/page.tsx" | \
  grep -v "app/(tools)/date-tools/page.tsx" | \
  grep -v "app/(tools)/tools/specialized/page.tsx" | \
  sort)

TOTAL_PAGES=$(echo "$TOOL_PAGES" | wc -l)
echo "Found $TOTAL_PAGES tool pages"
echo ""

ADDED=0
SKIPPED=0
FAILED=0

for page in $TOOL_PAGES; do
  # Check if CTA already added
  if grep -q "PortfolioCTA" "$page"; then
    echo "✓ Already has CTA: $page"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi
  
  # Extract tool ID from path
  # Pattern: app/(tools)/category/subcategory/page.tsx -> category-subcategory
  tool_id=$(echo "$page" | sed -E 's|app/\(tools\)/(.+)/page\.tsx|\1|' | tr '/' '-')
  
  # Extract the component name from the import
  component_import=$(grep -E "^import .+ from '@/features/|^import .+ from '@/components/features/" "$page" | head -1 | sed -E "s|import (.+) from .*|\1|")
  
  if [ -z "$component_import" ]; then
    echo "⊘ Skipping (no component import found): $page"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi
  
  echo "→ Adding CTA to: $page (tool: $tool_id, component: $component_import)"
  
  # Backup original
  cp "$page" "$page.bak"
  
  # Add import if not present
  if ! grep -q "import.*PortfolioCTA" "$page"; then
    # Find the last import line and add after it
    LAST_IMPORT_LINE=$(grep -n "^import" "$page" | tail -1 | cut -d: -f1)
    sed -i "${LAST_IMPORT_LINE}a import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';" "$page"
  fi
  
  # Find the ToolSeoContent line
  SEO_LINE=$(grep -n "<ToolSeoContent" "$page" | head -1 | cut -d: -f1)
  
  if [ -z "$SEO_LINE" ]; then
    echo "  ✗ Failed to add CTA: $page (no ToolSeoContent found)"
    rm "$page.bak"
    FAILED=$((FAILED + 1))
    continue
  fi
  
  # Add CTA before ToolSeoContent
  # We need to insert before the SEO content line
  INSERT_LINE=$((SEO_LINE))
  
  # Use Python for reliable multi-line insertion
  python3 -c "
import sys
with open('$page', 'r') as f:
    lines = f.readlines()

cta_block = [
    '      <div className=\"mt-8\">\n',
    '        <PortfolioCTA variant=\"tool-result\" toolId=\"$tool_id\" />\n',
    '      </div>\n',
    '\n'
]

# Insert before the SEO line
insert_pos = $SEO_LINE - 1
for i, line in enumerate(cta_block):
    lines.insert(insert_pos + i, line)

with open('$page', 'w') as f:
    f.writelines(lines)
"
  
  ADDED=$((ADDED + 1))
  echo "  ✓ Added CTA"
done

echo ""
echo "=== Summary ==="
echo "Total pages found: $TOTAL_PAGES"
echo "CTAs added: $ADDED"
echo "Already had CTA: $SKIPPED"
echo "Failed: $FAILED"
echo ""

if [ $ADDED -gt 0 ]; then
  echo "Next steps:"
  echo "1. Run 'pnpm lint:fix' to fix any formatting issues"
  echo "2. Run 'pnpm typecheck' to verify TypeScript compilation"
  echo "3. Run 'pnpm test' to run tests"
  echo "4. Review changes and commit"
  echo ""
  echo "To rollback changes:"
  echo "  find app -name '*.bak' -exec sh -c 'mv \"\$1\" \"\${1%.bak}\"' _ {} \\;"
fi
