import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const root = process.cwd();
const contentDir = path.join(root, 'content', 'blog');
const publicDir = path.join(root, 'public');
const auditDir = path.join(root, 'docs', 'audit');
const today = new Date().toISOString().slice(0, 10);
const markdownReportPath = path.join(auditDir, `blog-image-audit-${today}.md`);
const jsonReportPath = path.join(auditDir, `blog-image-audit-${today}.json`);

const allowedExtensions = new Set(['.webp', '.avif', '.jpg', '.jpeg', '.png', '.svg']);
const genericAlt = new Set([
  '',
  'image',
  'تصویر',
  'cover',
  'کاور',
  'عکس',
  'blog image',
  'تصویر مقاله',
]);

const issues = [];
const posts = [];

function addIssue(level, slug, field, message, details = {}) {
  issues.push({ level, slug, field, message, ...details });
}

function publicPathToFile(imagePath) {
  if (typeof imagePath !== 'string' || !imagePath.startsWith('/')) {
    return null;
  }
  return path.join(publicDir, imagePath.replace(/^\/+/, ''));
}

function readSignature(filePath) {
  const buffer = fs.readFileSync(filePath);
  return buffer.subarray(0, 16);
}

function signatureMatches(filePath, ext) {
  if (ext === '.svg') {
    const head = fs.readFileSync(filePath, 'utf8').slice(0, 200).trimStart();
    return head.startsWith('<svg') || head.startsWith('<?xml');
  }
  const sig = readSignature(filePath);
  if (ext === '.png') {
    return sig[0] === 0x89 && sig[1] === 0x50 && sig[2] === 0x4e && sig[3] === 0x47;
  }
  if (ext === '.jpg' || ext === '.jpeg') {
    return sig[0] === 0xff && sig[1] === 0xd8 && sig[2] === 0xff;
  }
  if (ext === '.webp') {
    return sig.toString('ascii', 0, 4) === 'RIFF' && sig.toString('ascii', 8, 12) === 'WEBP';
  }
  if (ext === '.avif') {
    return sig.toString('ascii', 4, 12).includes('ftypavif');
  }
  return false;
}

function checkImagePath(slug, field, imagePath) {
  if (typeof imagePath !== 'string' || imagePath.trim() === '') {
    addIssue('error', slug, field, `${field} is missing`);
    return;
  }
  if (!imagePath.startsWith('/')) {
    addIssue('error', slug, field, `${field} must be an absolute public path`, { imagePath });
    return;
  }
  if (imagePath.includes('..')) {
    addIssue('error', slug, field, `${field} contains malformed path traversal`, { imagePath });
    return;
  }

  const ext = path.extname(imagePath).toLowerCase();
  if (!allowedExtensions.has(ext)) {
    addIssue('error', slug, field, `${field} uses unsupported extension`, { imagePath, ext });
  }

  const expectedFolder = `/images/blog/${slug}/`;
  if (imagePath.startsWith('/images/blog/') && !imagePath.startsWith(expectedFolder)) {
    addIssue('warning', slug, field, `${field} folder does not match article slug`, {
      imagePath,
      expectedFolder,
    });
  }

  const filePath = publicPathToFile(imagePath);
  if (!filePath || !fs.existsSync(filePath)) {
    addIssue('error', slug, field, `${field} file does not exist under public/`, { imagePath });
    return;
  }

  const stat = fs.statSync(filePath);
  if (stat.size > 300 * 1024) {
    addIssue('error', slug, field, `${field} is larger than 300KB`, {
      imagePath,
      sizeKb: Math.round(stat.size / 1024),
    });
  } else if (stat.size > 180 * 1024) {
    addIssue('warning', slug, field, `${field} is larger than 180KB`, {
      imagePath,
      sizeKb: Math.round(stat.size / 1024),
    });
  }

  if (allowedExtensions.has(ext) && !signatureMatches(filePath, ext)) {
    addIssue('error', slug, field, `${field} file signature does not match extension`, {
      imagePath,
      ext,
    });
  }
}

function findInlineImages(content) {
  const matches = [];
  const imagePattern = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let match;
  while ((match = imagePattern.exec(content)) !== null) {
    matches.push({ alt: match[1] ?? '', path: match[2] ?? '' });
  }
  return matches;
}

function auditPost(fileName) {
  const slug = fileName.replace(/\.md$/, '');
  const filePath = path.join(contentDir, fileName);
  let parsed;
  try {
    parsed = matter(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    addIssue('error', slug, 'frontmatter', `frontmatter parse failed: ${error.message}`);
    return;
  }

  const data = parsed.data;
  posts.push(slug);
  checkImagePath(slug, 'coverImage', data.coverImage);

  const coverAlt = String(data.coverAlt ?? '').trim();
  if (!coverAlt) {
    addIssue('error', slug, 'coverAlt', 'coverAlt is missing');
  } else if (genericAlt.has(coverAlt.toLowerCase())) {
    addIssue('warning', slug, 'coverAlt', 'coverAlt is generic', { coverAlt });
  }

  if (!String(data.imageCaption ?? '').trim()) {
    addIssue('warning', slug, 'imageCaption', 'imageCaption is missing');
  }

  for (const image of findInlineImages(parsed.content)) {
    if (!image.alt.trim()) {
      addIssue('error', slug, 'inlineImage', 'inline markdown image is missing alt text', {
        imagePath: image.path,
      });
    }
    if (image.path.startsWith('/')) {
      checkImagePath(slug, 'inlineImage', image.path);
    } else if (!/^https?:\/\//.test(image.path)) {
      addIssue('error', slug, 'inlineImage', 'inline image path is malformed', {
        imagePath: image.path,
      });
    }
  }
}

function writeReports() {
  fs.mkdirSync(auditDir, { recursive: true });
  const summary = {
    generatedAt: new Date().toISOString(),
    postsScanned: posts.length,
    errors: issues.filter((issue) => issue.level === 'error').length,
    warnings: issues.filter((issue) => issue.level === 'warning').length,
    issues,
  };

  fs.writeFileSync(jsonReportPath, `${JSON.stringify(summary, null, 2)}\n`);

  const rows =
    issues.length > 0
      ? issues
          .map(
            (issue) =>
              `| ${issue.level} | ${issue.slug} | ${issue.field} | ${issue.message.replace(/\|/g, '\\|')} | ${
                issue.imagePath ?? ''
              } |`,
          )
          .join('\n')
      : '| info | all | images | No image issues found. | |';

  const markdown = `# Blog Image Audit - ${today}

- Generated at: ${summary.generatedAt}
- Posts scanned: ${summary.postsScanned}
- Errors: ${summary.errors}
- Warnings: ${summary.warnings}

| Level | Slug | Field | Message | Path |
| --- | --- | --- | --- | --- |
${rows}
`;
  fs.writeFileSync(markdownReportPath, markdown);
  console.log(`[blog-images] scanned ${summary.postsScanned} posts`);
  console.log(`[blog-images] errors=${summary.errors} warnings=${summary.warnings}`);
  console.log(`[blog-images] markdown=${path.relative(root, markdownReportPath)}`);
  console.log(`[blog-images] json=${path.relative(root, jsonReportPath)}`);
  return summary;
}

if (!fs.existsSync(contentDir)) {
  throw new Error(`Missing content directory: ${contentDir}`);
}

const files = fs.readdirSync(contentDir).filter((file) => file.endsWith('.md')).sort();
for (const file of files) {
  auditPost(file);
}

const summary = writeReports();
if (summary.errors > 0) {
  process.exitCode = 1;
}
