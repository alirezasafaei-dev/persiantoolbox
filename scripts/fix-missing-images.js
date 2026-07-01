const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..', 'content', 'blog');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'blog');

// Get list of actual image directories
const existingImageDirs = fs.readdirSync(IMAGES_DIR).filter((f) => {
  const dirPath = path.join(IMAGES_DIR, f);
  return fs.statSync(dirPath).isDirectory();
});

console.log('Existing image directories:', existingImageDirs.length);

// Get list of articles with coverImage
const articles = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
let removed = 0;
let kept = 0;

for (const article of articles) {
  const filePath = path.join(BLOG_DIR, article);
  let content = fs.readFileSync(filePath, 'utf8');

  // Extract coverImage path
  const match = content.match(/coverImage:\s*'([^']+)'/);
  if (!match) continue;

  const coverImagePath = match[1];
  // Extract directory name from path like /images/blog/xxx/cover.webp
  const dirMatch = coverImagePath.match(/\/images\/blog\/([^/]+)\//);
  if (!dirMatch) continue;

  const imageDir = dirMatch[1];

  // Check if this image directory exists
  if (!existingImageDirs.includes(imageDir)) {
    // Remove coverImage, coverAlt, imageCaption from this article
    content = content.replace(/\ncoverImage:\s*'[^']+'/, '');
    content = content.replace(/\ncoverAlt:\s*'[^']+'/, '');
    content = content.replace(/\nimageCaption:\s*'[^']+'/, '');
    fs.writeFileSync(filePath, content, 'utf8');
    removed++;
  } else {
    kept++;
  }
}

console.log(`Done: ${kept} kept, ${removed} removed`);
