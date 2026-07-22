#!/usr/bin/env node

/**
 * add-cross-links.mjs
 *
 * Reads all blog articles, finds 2-3 related articles based on shared
 * tags/categories, and adds a `relatedPosts` frontmatter field with slugs.
 *
 * Usage: node scripts/seo/add-cross-links.mjs [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..', '..');
const BLOG_DIR = path.join(PROJECT_ROOT, 'content', 'blog');

const DRY_RUN = process.argv.includes('--dry-run');

function loadAllPosts() {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
  const posts = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
    const { data, content } = matter(raw);
    posts.push({
      file,
      slug: file.replace(/\.md$/, ''),
      title: String(data['title'] ?? ''),
      category: String(data['category'] ?? ''),
      tags: Array.isArray(data['tags']) ? data['tags'].map(String) : [],
      series: typeof data['series'] === 'object' && data['series'] !== null
        ? String(data['series']['name'] ?? '')
        : data['series'] ? String(data['series']) : null,
      wordCount: content.split(/\s+/).filter(Boolean).length,
      raw,
    });
  }

  return posts;
}

function scoreRelated(current, candidate) {
  if (current.slug === candidate.slug) return -1;

  let score = 0;

  if (current.category === candidate.category) score += 3;

  const sharedTags = current.tags.filter((t) => candidate.tags.includes(t));
  score += sharedTags.length * 2;

  if (current.series && current.series === candidate.series) score += 5;

  return score;
}

function findRelatedPosts(current, allPosts, limit = 3) {
  const scored = allPosts
    .map((candidate) => ({
      slug: candidate.slug,
      score: scoreRelated(current, candidate),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((item) => item.slug);
}

function addRelatedPosts(filePath, raw, relatedSlugs) {
  const frontmatterEnd = raw.indexOf('---', 3);
  if (frontmatterEnd === -1) return raw;

  const frontmatter = raw.slice(4, frontmatterEnd);
  if (frontmatter.includes('relatedPosts:')) return raw;

  const content = raw.slice(frontmatterEnd + 3);
  const relatedYaml = relatedSlugs.map((s) => `    - '${s}'`).join('\n');
  const newFrontmatter = frontmatter.trimEnd() + `\nrelatedPosts:\n${relatedYaml}\n`;

  return '---\n' + newFrontmatter + '---' + content;
}

function main() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.error(`Blog directory not found: ${BLOG_DIR}`);
    process.exit(1);
  }

  const posts = loadAllPosts();
  console.log(`Found ${posts.length} blog articles.`);

  let updated = 0;
  let skipped = 0;

  for (const post of posts) {
    if (post.raw.includes('relatedPosts:')) {
      skipped++;
      continue;
    }

    const related = findRelatedPosts(post, posts, 3);
    if (related.length === 0) {
      skipped++;
      continue;
    }

    const filePath = path.join(BLOG_DIR, post.file);
    const newContent = addRelatedPosts(filePath, post.raw, related);

    if (!DRY_RUN && newContent !== post.raw) {
      fs.writeFileSync(filePath, newContent, 'utf8');
    }

    updated++;
    console.log(`  ✓ ${post.file} → [${related.join(', ')}]`);
  }

  console.log(`\nDone. ${updated} updated, ${skipped} skipped (already had relatedPosts or no matches).`);
}

main();
