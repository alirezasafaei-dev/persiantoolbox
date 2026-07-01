const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..', 'content', 'blog');
const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));

let fixed = 0;

for (const file of files) {
  const filePath = path.join(BLOG_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Find frontmatter boundaries
  const lines = content.split('\n');
  let fmStart = -1;
  let fmEnd = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      if (fmStart === -1) {
        fmStart = i;
      } else {
        fmEnd = i;
        break;
      }
    }
  }

  if (fmStart === -1 || fmEnd === -1) continue;

  // Check if coverImage is outside frontmatter
  let coverLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('coverImage:')) {
      coverLine = i;
      break;
    }
  }

  if (coverLine === -1) continue;

  if (coverLine > fmEnd) {
    // coverImage is outside frontmatter - need to move it inside
    // Extract the cover fields
    const coverFields = [];
    let j = coverLine;
    while (
      j < lines.length &&
      (lines[j].startsWith('coverImage:') ||
        lines[j].startsWith('coverAlt:') ||
        lines[j].startsWith('imageCaption:') ||
        lines[j].startsWith('reviewedBy:') ||
        lines[j].startsWith('reviewedDate:'))
    ) {
      coverFields.push(lines[j]);
      j++;
    }

    // Remove the fields from outside
    lines.splice(coverLine, j - coverLine);

    // Find the new fmEnd (it shifted)
    let newFmEnd = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '---' && i > fmStart) {
        newFmEnd = i;
        break;
      }
    }

    // Insert before closing ---
    lines.splice(newFmEnd, 0, ...coverFields);

    content = lines.join('\n');
    fs.writeFileSync(filePath, content, 'utf8');
    fixed++;
  }
}

console.log(`Fixed ${fixed} files`);
