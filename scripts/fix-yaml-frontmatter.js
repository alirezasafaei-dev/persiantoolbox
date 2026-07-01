const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..', 'content', 'blog');

const filesToFix = [
  '2026-06-02-financial-tools-pillar.md',
  '2026-06-03-pdf-tools-pillar.md',
  '2026-06-04-image-tools-pillar.md',
  '2026-06-05-date-tools-pillar.md',
  '2026-06-06-text-tools-pillar.md',
  '2026-06-08-business-tools-pillar.md',
  '2026-06-09-career-tools-pillar.md',
  '2026-06-10-contract-tools-pillar.md',
  '2026-06-15-resume-template-guide.md',
];

for (const file of filesToFix) {
  const filePath = path.join(BLOG_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP: ${file} not found`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Fix: ensure there's a proper --- after reviewedDate
  // Pattern: reviewedDate: null\n--- or reviewedDate: null\n\n---
  // Should be: reviewedDate: null\n---
  content = content.replace(/reviewedDate: null\n+---/, 'reviewedDate: null\n---');

  // Also fix case where --- is on same line
  content = content.replace(/reviewedDate: null---/, 'reviewedDate: null\n---');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`FIXED: ${file}`);
}

console.log('Done!');
