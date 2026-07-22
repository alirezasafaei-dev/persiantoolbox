#!/usr/bin/env node

/**
 * add-faq-schema.mjs
 *
 * Reads all markdown files from content/blog/, analyzes each article,
 * and adds a `faq` frontmatter field with 3-5 FAQ pairs extracted from
 * headings, Q&A patterns, and key content points. Questions are in Persian.
 *
 * Usage: node scripts/seo/add-faq-schema.mjs [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..', '..');
const BLOG_DIR = path.join(PROJECT_ROOT, 'content', 'blog');

const DRY_RUN = process.argv.includes('--dry-run');

function extractHeadings(content) {
  const headings = [];
  const regex = /^#{2,4}\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    headings.push(match[1].trim());
  }
  return headings;
}

function extractParagraphs(content) {
  const cleaned = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\|.*\|/g, '')
    .replace(/^#{1,6}\s+.*/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`~]/g, '');

  return cleaned
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 30);
}

function sentenceToQuestion(sentence) {
  let q = sentence.replace(/[.،؛!؟]+$/, '').trim();
  if (!q.endsWith('?') && !q.endsWith('؟')) {
    q = 'چگونه ' + q + '؟';
  }
  return q;
}

function generateFaqPairs(headings, paragraphs, title, tags) {
  const faq = [];
  const seen = new Set();

  for (const heading of headings) {
    if (faq.length >= 5) break;
    if (heading.length < 10 || heading.length > 80) continue;
    if (seen.has(heading)) continue;
    seen.add(heading);

    const question = heading.endsWith('؟') || heading.endsWith('?')
      ? heading
      : heading + '؟';

    const headingIdx = paragraphs.findIndex((p) => {
      const hClean = heading.replace(/[^آ-یa-zA-Z0-9\s]/g, '').toLowerCase();
      return p.toLowerCase().includes(hClean.slice(0, 20));
    });

    let answer = '';
    if (headingIdx >= 0 && headingIdx < paragraphs.length) {
      answer = paragraphs[headingIdx].slice(0, 300);
    } else if (headingIdx >= 0 && headingIdx + 1 < paragraphs.length) {
      answer = paragraphs[headingIdx + 1].slice(0, 300);
    }

    if (answer.length < 20) continue;
    if (!answer.endsWith('.') && !answer.endsWith('!') && !answer.endsWith('؟')) {
      const lastPeriod = Math.max(answer.lastIndexOf('.'), answer.lastIndexOf('!'), answer.lastIndexOf('؟'));
      if (lastPeriod > 50) {
        answer = answer.slice(0, lastPeriod + 1);
      } else {
        answer += '.';
      }
    }

    faq.push({ question, answer });
  }

  if (faq.length < 3 && paragraphs.length > 0) {
    const tagStr = tags.join(' ');
    for (const p of paragraphs) {
      if (faq.length >= 5) break;
      if (p.length < 40 || p.length > 500) continue;

      const q = sentenceToQuestion(p.slice(0, 80));
      if (seen.has(q)) continue;
      seen.add(q);

      let a = p.slice(0, 300);
      if (!a.endsWith('.') && !a.endsWith('!') && !a.endsWith('؟')) {
        const lastPeriod = Math.max(a.lastIndexOf('.'), a.lastIndexOf('!'), a.lastIndexOf('؟'));
        if (lastPeriod > 50) {
          a = a.slice(0, lastPeriod + 1);
        } else {
          a += '.';
        }
      }

      if (a.length >= 20) {
        faq.push({ question: q, answer: a });
      }
    }
  }

  return faq.slice(0, 5);
}

function processFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const frontmatterEnd = raw.indexOf('---', 3);
  if (frontmatterEnd === -1) return false;

  const frontmatter = raw.slice(4, frontmatterEnd);
  const content = raw.slice(frontmatterEnd + 3);

  if (frontmatter.includes('faq:')) return false;

  const titleMatch = frontmatter.match(/title:\s*['"](.+?)['"]/);
  const tagsMatch = frontmatter.match(/tags:\s*\[([^\]]*)\]/);
  const title = titleMatch ? titleMatch[1] : path.basename(filePath, '.md');
  const tags = tagsMatch
    ? tagsMatch[1].split(',').map((t) => t.trim().replace(/['"]/g, ''))
    : [];

  const headings = extractHeadings(content);
  const paragraphs = extractParagraphs(content);

  const faq = generateFaqPairs(headings, paragraphs, title, tags);
  if (faq.length === 0) return false;

  const faqYaml = faq
    .map((item) => {
      const q = item.question.replace(/'/g, "''");
      const a = item.answer.replace(/'/g, "''");
      return `    - question: '${q}'\n      answer: '${a}'`;
    })
    .join('\n');

  const newFrontmatter = frontmatter.trimEnd() + `\nfaq:\n${faqYaml}\n`;

  const updated = '---\n' + newFrontmatter + '---' + content;

  if (!DRY_RUN) {
    fs.writeFileSync(filePath, updated, 'utf8');
  }

  return true;
}

function main() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.error(`Blog directory not found: ${BLOG_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
  console.log(`Found ${files.length} blog articles.`);

  let updated = 0;
  let skipped = 0;

  for (const file of files) {
    const filePath = path.join(BLOG_DIR, file);
    const changed = processFile(filePath);
    if (changed) {
      updated++;
      console.log(`  ✓ ${file}`);
    } else {
      skipped++;
    }
  }

  console.log(`\nDone. ${updated} updated, ${skipped} skipped (already had FAQ or no FAQ extractable).`);
}

main();
