#!/usr/bin/env node
/**
 * Blog images audit script.
 * Usage: pnpm blog:images:audit
 * Outputs summary and JSON report.
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const REPORT_DIR = path.join(process.cwd(), 'docs', 'audit');

const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];

function getAllMdFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllMdFiles(full));
    } else if (entry.name.endsWith('.md')) {
      files.push(full);
    }
  }
  return files;
}

function checkImage(fullPath, relPath) {
  const result = {
    path: relPath,
    exists: false,
    size: 0,
    ext: path.extname(relPath).toLowerCase(),
    validExt: false,
    sizeOk: false,
    issues: [],
  };

  if (!fs.existsSync(fullPath)) {
    result.issues.push('file missing in public/');
    return result;
  }

  result.exists = true;
  const stat = fs.statSync(fullPath);
  result.size = stat.size;
  result.validExt = ALLOWED_EXTS.includes(result.ext);
  result.sizeOk = result.size < 250 * 1024; // 250KB

  if (!result.validExt) result.issues.push(`invalid extension ${result.ext}`);
  if (!result.sizeOk) result.issues.push(`size ${Math.round(result.size / 1024)}KB exceeds 250KB`);

  // basic mime check not implemented without deps
  return result;
}

function audit() {
  console.log('=== Blog Images Audit ===');
  const mdFiles = getAllMdFiles(CONTENT_DIR);
  console.log(`Found ${mdFiles.length} articles`);

  const results = [];
  let missingCover = 0;
  let badSize = 0;
  let noAlt = 0;
  let noCaption = 0;

  for (const mdPath of mdFiles) {
    const content = fs.readFileSync(mdPath, 'utf8');
    const { data } = matter(content);
    const slug = data.slug || path.basename(mdPath, '.md');

    const report = {
      slug,
      coverImage: data.coverImage || null,
      coverAlt: data.coverAlt || null,
      imageCaption: data.imageCaption || null,
      issues: [],
    };

    if (!data.coverImage) {
      report.issues.push('missing coverImage');
      missingCover++;
    } else {
      const rel = data.coverImage.startsWith('/') ? data.coverImage.slice(1) : data.coverImage;
      const full = path.join(PUBLIC_DIR, rel);
      const imgCheck = checkImage(full, rel);
      if (!imgCheck.exists) {
        report.issues.push(`cover not found: ${rel}`);
      } else {
        if (!imgCheck.sizeOk) {
          badSize++;
          report.issues.push(`cover too large: ${Math.round(imgCheck.size/1024)}KB`);
        }
        if (!imgCheck.validExt) {
          report.issues.push(`bad cover ext: ${imgCheck.ext}`);
        }
      }
    }

    if (!data.coverAlt || data.coverAlt.trim().length < 5) {
      noAlt++;
      report.issues.push('missing or weak coverAlt');
    }
    if (!data.imageCaption || data.imageCaption.trim().length < 3) {
      noCaption++;
      report.issues.push('missing or weak imageCaption');
    }

    // TODO: inline images check would require parsing markdown content for ![alt](url)
    // for now basic

    if (report.issues.length > 0) {
      results.push(report);
    }
  }

  console.log(`Missing covers: ${missingCover}`);
  console.log(`Large covers: ${badSize}`);
  console.log(`Weak alt: ${noAlt}`);
  console.log(`Weak caption: ${noCaption}`);

  if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });

  const date = new Date().toISOString().slice(0,10);
  const mdPath = path.join(REPORT_DIR, `blog-image-audit-${date}.md`);
  const jsonPath = path.join(REPORT_DIR, `blog-image-audit-${date}.json`);

  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  fs.writeFileSync(mdPath, `# Blog Image Audit ${date}\n\n` + 
    `Total articles: ${mdFiles.length}\n` +
    `Issues found: ${results.length}\n\n` +
    results.map(r => `- ${r.slug}: ${r.issues.join('; ')}`).join('\n'));

  console.log(`Report written to ${mdPath} and ${jsonPath}`);
}

audit();
