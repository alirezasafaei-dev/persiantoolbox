const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..', 'content', 'blog');
const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));

let fixed = 0;

for (const file of files) {
  const filePath = path.join(BLOG_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Pattern: published: true\n---\ncoverImage → published: true\ncoverImage\n...\n---
  // Need to move coverImage fields before the closing ---

  const pattern =
    /(published: (?:true|false))\n---\n(coverImage: .+?\ncoverAlt: .+?\nimageCaption: .+?\nreviewedBy: null\nreviewedDate: null)\n+/;
  const match = content.match(pattern);

  if (match) {
    const newContent = content.replace(pattern, `$1\n$2\n---\n`);
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      fixed++;
    }
  }
}

console.log(`Fixed ${fixed} files`);
