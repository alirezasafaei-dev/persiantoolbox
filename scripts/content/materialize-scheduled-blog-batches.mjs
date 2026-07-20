import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const GENERATED_MARKER = '<!-- generated-from: scheduled-blog-batches -->';
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function escapeYaml(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''")
    .replace(/\r?\n/g, ' ')
    .trim();
}

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function yamlArray(values) {
  return `[${values.map((value) => `'${escapeYaml(value)}'`).join(', ')}]`;
}

function renderTable(table) {
  if (!table?.headers?.length || !table?.rows?.length) {
    return '';
  }
  const header = `| ${table.headers.join(' | ')} |`;
  const separator = `| ${table.headers.map(() => '---').join(' | ')} |`;
  const rows = table.rows.map((row) => `| ${row.join(' | ')} |`).join('\n');
  return `${header}\n${separator}\n${rows}`;
}

export function renderScheduledArticle(article) {
  const frontmatter = [
    '---',
    `title: '${escapeYaml(article.title)}'`,
    `slug: '${article.slug}'`,
    `date: '${article.date}'`,
    `modifiedDate: '${article.date}'`,
    `author: '${escapeYaml(article.author ?? 'تیم فارسی')}'`,
    `category: '${escapeYaml(article.category)}'`,
    `tags: ${yamlArray(article.tags)}`,
    `description: '${escapeYaml(article.description)}'`,
    'published: true',
    `difficulty: '${escapeYaml(article.difficulty ?? 'مبتدی')}'`,
    `series: '${escapeYaml(article.series ?? 'راهنمای گردش کار دیجیتال')}'`,
    `seriesOrder: ${Number(article.seriesOrder)}`,
    'featured: false',
    `coverImage: '/images/blog/${article.slug}/cover.svg'`,
    `coverAlt: '${escapeYaml(article.coverAlt ?? article.title)}'`,
    `imageCaption: '${escapeYaml(
      article.imageCaption ?? `راهنمای ${article.title} — جعبه ابزار فارسی`,
    )}'`,
    '---',
  ].join('\n');

  const body = [GENERATED_MARKER, '', `# ${article.title}`, ''];

  for (const paragraph of article.intro ?? []) {
    body.push(paragraph, '');
  }

  for (const section of article.sections ?? []) {
    body.push(`## ${section.heading}`, '');
    for (const paragraph of section.paragraphs ?? []) {
      body.push(paragraph, '');
    }
    for (const item of section.bullets ?? []) {
      body.push(`- ${item}`);
    }
    if (section.bullets?.length) {
      body.push('');
    }
    const table = renderTable(section.table);
    if (table) {
      body.push(table, '');
    }
    if (section.example) {
      body.push(`### ${section.example.title ?? 'مثال عملی'}`, '', section.example.body, '');
    }
  }

  if (article.checklist?.length) {
    body.push('## چک‌لیست اجرایی', '');
    for (const item of article.checklist) {
      body.push(`- [ ] ${item}`);
    }
    body.push('');
  }

  if (article.faq?.length) {
    body.push('## سوالات متداول', '');
    for (const item of article.faq) {
      body.push(`### ${item.question}`, '', item.answer, '');
    }
  }

  if (article.links?.length) {
    body.push('## ابزارها و مسیرهای مرتبط', '');
    for (const link of article.links) {
      body.push(`- [${link.label}](${link.url})`);
    }
    body.push('');
  }

  if (article.disclaimer) {
    body.push(`> **توجه:** ${article.disclaimer}`, '');
  }

  body.push('## جمع‌بندی', '', article.conclusion, '');
  body.push(
    `**گام بعدی:** [${article.cta.label}](${article.cta.url}) و نتیجه را مستقیماً روی دستگاه خود آماده کنید.`,
    '',
  );

  return `${frontmatter}\n\n${body.join('\n').trim()}\n`;
}

export function renderScheduledCover(article) {
  const title = escapeXml(article.title);
  const category = escapeXml(article.category);
  const date = escapeXml(article.date);
  const accent = article.accent ?? '#7c3aed';
  const secondary = article.secondary ?? '#0ea5e9';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0f172a"/>
      <stop offset="0.55" stop-color="${accent}"/>
      <stop offset="1" stop-color="${secondary}"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="18" flood-opacity="0.28"/>
    </filter>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1040" cy="110" r="180" fill="#fff" opacity="0.08"/>
  <circle cx="110" cy="590" r="220" fill="#fff" opacity="0.05"/>
  <rect x="70" y="60" width="1060" height="510" rx="36" fill="#0f172a" opacity="0.46" filter="url(#shadow)"/>
  <foreignObject x="110" y="100" width="980" height="430">
    <div xmlns="http://www.w3.org/1999/xhtml" dir="rtl" style="height:100%;display:flex;flex-direction:column;justify-content:space-between;color:#fff;font-family:Vazirmatn,Tahoma,sans-serif">
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:25px;font-weight:700">
        <span style="padding:10px 22px;border-radius:999px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.22)">${category}</span>
        <span style="opacity:.78">${date}</span>
      </div>
      <div style="font-size:55px;line-height:1.45;font-weight:900;text-shadow:0 3px 14px rgba(0,0,0,.25)">${title}</div>
      <div style="display:flex;align-items:center;gap:14px;font-size:27px;font-weight:800">
        <span style="width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.16)">ج</span>
        <span>جعبه ابزار فارسی</span>
      </div>
    </div>
  </foreignObject>
</svg>
`;
}

function validateArticles(articles) {
  const slugs = new Set();
  const dates = new Set();
  const errors = [];

  for (const [index, article] of articles.entries()) {
    const position = index + 1;
    if (!article.title?.trim()) errors.push(`article ${position}: title is required`);
    if (!SLUG_PATTERN.test(article.slug ?? '')) errors.push(`article ${position}: invalid slug`);
    if (!DATE_PATTERN.test(article.date ?? '')) errors.push(`article ${position}: invalid date`);
    if (!article.category?.trim()) errors.push(`article ${position}: category is required`);
    if (!Array.isArray(article.tags) || article.tags.length < 3) {
      errors.push(`article ${position}: at least 3 tags are required`);
    }
    if (!Array.isArray(article.sections) || article.sections.length < 3) {
      errors.push(`article ${position}: at least 3 sections are required`);
    }
    if (!Array.isArray(article.checklist) || article.checklist.length < 4) {
      errors.push(`article ${position}: at least 4 checklist items are required`);
    }
    if (!Array.isArray(article.faq) || article.faq.length < 2) {
      errors.push(`article ${position}: at least 2 FAQ items are required`);
    }
    if (!article.cta?.url?.startsWith('/')) errors.push(`article ${position}: CTA must be internal`);
    if (slugs.has(article.slug)) errors.push(`duplicate slug: ${article.slug}`);
    if (dates.has(article.date)) errors.push(`duplicate publication date: ${article.date}`);
    slugs.add(article.slug);
    dates.add(article.date);
  }

  if (errors.length > 0) {
    throw new Error(`Scheduled blog manifest validation failed:\n- ${errors.join('\n- ')}`);
  }
}

async function loadScheduledArticles(root) {
  const batchesDir = join(root, 'content', 'scheduled-batches');
  if (!existsSync(batchesDir)) {
    return [];
  }

  const files = readdirSync(batchesDir)
    .filter((file) => file.endsWith('.mjs'))
    .sort();
  const articles = [];

  for (const file of files) {
    const moduleUrl = `${pathToFileURL(join(batchesDir, file)).href}?v=${Date.now()}`;
    const batch = await import(moduleUrl);
    if (!Array.isArray(batch.scheduledBlogArticles)) {
      throw new Error(`${file} must export scheduledBlogArticles[]`);
    }
    articles.push(...batch.scheduledBlogArticles);
  }

  validateArticles(articles);
  return articles.sort((a, b) => a.date.localeCompare(b.date));
}

function writeGeneratedFile(filePath, content) {
  if (existsSync(filePath)) {
    const existing = readFileSync(filePath, 'utf8');
    if (!existing.includes(GENERATED_MARKER)) {
      throw new Error(`Refusing to overwrite manually maintained file: ${filePath}`);
    }
  }
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, 'utf8');
}

export async function materializeScheduledBlogBatches({ root = process.cwd(), dryRun = false } = {}) {
  const resolvedRoot = resolve(root);
  const articles = await loadScheduledArticles(resolvedRoot);

  for (const article of articles) {
    const markdown = renderScheduledArticle(article);
    const wordCount = markdown.split(/\s+/).filter(Boolean).length;
    if (wordCount < 450) {
      throw new Error(`${article.slug} is too short (${wordCount} words/tokens)`);
    }

    if (!dryRun) {
      writeGeneratedFile(join(resolvedRoot, 'content', 'blog', `${article.slug}.md`), markdown);
      const coverPath = join(
        resolvedRoot,
        'public',
        'images',
        'blog',
        article.slug,
        'cover.svg',
      );
      mkdirSync(dirname(coverPath), { recursive: true });
      writeFileSync(coverPath, renderScheduledCover(article), 'utf8');
    }
  }

  console.log(
    `[scheduled-blog] ${dryRun ? 'validated' : 'materialized'} ${articles.length} articles (${articles[0]?.date ?? 'n/a'} → ${articles.at(-1)?.date ?? 'n/a'})`,
  );
  return articles;
}

const isDirectExecution = process.argv[1]
  ? import.meta.url === pathToFileURL(resolve(process.argv[1])).href
  : false;

if (isDirectExecution) {
  await materializeScheduledBlogBatches({ dryRun: process.argv.includes('--check') });
}
