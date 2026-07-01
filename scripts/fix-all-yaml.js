const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..', 'content', 'blog');
const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));

let fixed = 0;

for (const file of files) {
  const filePath = path.join(BLOG_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix pattern: reviewedDate: null--- → reviewedDate: null\n---
  content = content.replace(/reviewedDate: null---/g, 'reviewedDate: null\n---');

  // Fix pattern: reviewedDate: null\n\n--- → reviewedDate: null\n---
  content = content.replace(/reviewedDate: null\n\n---/g, 'reviewedDate: null\n---');

  // Fix pattern: reviewedDate: null\n<empty lines>--- → reviewedDate: null\n---
  content = content.replace(/reviewedDate: null\n+---/g, 'reviewedDate: null\n---');

  // Fix pattern: published: true\n\ncoverImage → published: true\ncoverImage
  content = content.replace(/published: true\n\ncoverImage/g, 'published: true\ncoverImage');

  // Fix pattern: published: false\n\ncoverImage → published: false\ncoverImage
  content = content.replace(/published: false\n\ncoverImage/g, 'published: false\ncoverImage');

  if (content !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, content, 'utf8');
    fixed++;
  }
}

console.log(`Fixed ${fixed} files`);
