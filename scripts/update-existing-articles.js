const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..', 'content', 'blog');

const articlesToUpdate = [
  {
    file: '2026-06-02-financial-tools-pillar.md',
    coverImage: '/images/blog/financial-tools-pillar/cover.webp',
    coverAlt: 'ابزارهای مالی جعبه ابزار فارسی',
    imageCaption: 'مجموعه ابزارهای مالی آنلاین رایگان',
  },
  {
    file: '2026-06-03-pdf-tools-pillar.md',
    coverImage: '/images/blog/pdf-tools-pillar/cover.webp',
    coverAlt: 'ابزارهای PDF جعبه ابزار فارسی',
    imageCaption: 'مجموعه ابزارهای مدیریت فایل PDF',
  },
  {
    file: '2026-06-05-date-tools-pillar.md',
    coverImage: '/images/blog/date-tools-pillar/cover.webp',
    coverAlt: 'ابزارهای تاریخ جعبه ابزار فارسی',
    imageCaption: 'ابزارهای تبدیل و محاسبه تاریخ شمسی',
  },
  {
    file: '2026-06-04-image-tools-pillar.md',
    coverImage: '/images/blog/image-tools-pillar/cover.webp',
    coverAlt: 'ابزارهای ویرایش تصویر جعبه ابزار فارسی',
    imageCaption: 'ابزارهای آنلاین ویرایش و تبدیل تصویر',
  },
  {
    file: '2026-06-06-text-tools-pillar.md',
    coverImage: '/images/blog/text-tools-pillar/cover.webp',
    coverAlt: 'ابزارهای متنی جعبه ابزار فارسی',
    imageCaption: 'ابزارهای تبدیل و ویرایش متن فارسی',
  },
  {
    file: '2026-06-08-business-tools-pillar.md',
    coverImage: '/images/blog/business-tools-pillar/cover.webp',
    coverAlt: 'ابزارهای کسب‌وکار جعبه ابزار فارسی',
    imageCaption: 'ابزارهای فاکتورساز و مدیریت مالی',
  },
  {
    file: '2026-06-09-career-tools-pillar.md',
    coverImage: '/images/blog/career-tools-pillar/cover.webp',
    coverAlt: 'ابزارهای شغلی جعبه ابزار فارسی',
    imageCaption: 'ابزارهای رزومه‌ساز و مدیریت شغلی',
  },
  {
    file: '2026-06-10-contract-tools-pillar.md',
    coverImage: '/images/blog/contract-tools-pillar/cover.webp',
    coverAlt: 'ابزارهای قرارداد جعبه ابزار فارسی',
    imageCaption: 'ابزارهای تنظیم قراردادهای رسمی',
  },
  {
    file: '2026-06-15-loan-calculator-guide.md',
    coverImage: '/images/blog/loan-calculator-guide/cover.webp',
    coverAlt: 'ابزار محاسبه وام جعبه ابzar فارسی',
    imageCaption: 'راهنمای استفاده از ابزار محاسبه اقساط وام',
  },
  {
    file: '2026-06-15-resume-template-guide.md',
    coverImage: '/images/blog/resume-template-guide/cover.webp',
    coverAlt: 'قالب‌های رزومه حرفه‌ای',
    imageCaption: 'نمونه قالب‌های رزومه برای بازار کار ایران',
  },
];

let updated = 0;
let skipped = 0;

for (const article of articlesToUpdate) {
  const filePath = path.join(BLOG_DIR, article.file);

  if (!fs.existsSync(filePath)) {
    console.log(`✗ ${article.file} - file not found`);
    skipped++;
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Check if coverImage already exists
  if (content.includes('coverImage:')) {
    console.log(`⏭ ${article.file} - already has coverImage`);
    skipped++;
    continue;
  }

  // Find the frontmatter end
  const frontmatterEnd = content.indexOf('---', 3);
  if (frontmatterEnd === -1) {
    console.log(`✗ ${article.file} - invalid frontmatter`);
    skipped++;
    continue;
  }

  // Insert coverImage fields before the closing ---
  const insertPoint = frontmatterEnd;
  const newFields = `\ncoverImage: '${article.coverImage}'\ncoverAlt: '${article.coverAlt}'\nimageCaption: '${article.imageCaption}'\nreviewedBy: null\nreviewedDate: null`;

  content = content.slice(0, insertPoint) + newFields + content.slice(insertPoint);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ ${article.file} - updated`);
  updated++;
}

console.log(`\nDone: ${updated} updated, ${skipped} skipped`);
