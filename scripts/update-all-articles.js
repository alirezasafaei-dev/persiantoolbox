const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..', 'content', 'blog');

// Map article tags/categories to tool pages for cover images
const toolPageMap = {
  وام: '/loan',
  حقوق: '/salary',
  بیمه: '/tools/insurance-calculator',
  مالیات: '/tools/tax-calculator',
  PDF: '/pdf-tools',
  تصویر: '/image-tools',
  تاریخ: '/date-tools',
  رزومه: '/career-tools/resume-builder',
  قرارداد: '/contract-tools',
  امضا: '/text-tools/signature',
  OCR: '/tools/persian-ocr',
  ' QR': '/tools/qr-code',
  نیم‌فاصله: '/writing-tools/persian-writing-studio',
  password: '/tools/password-generator',
  هش: '/tools/hash-generator',
  base64: '/tools/base64',
  JSON: '/tools/json-formatter',
  سناریو: '/financial-scenarios',
  تورم: '/inflation-calculator',
  بازنشستگی: '/tools/retirement-calculator',
  ' سنوات': '/tools/severance-calculator',
  مرخصی: '/tools/leave-calculator',
  اضافه‌کاری: '/tools/overtime-calculator',
  سود: '/interest',
  ' سپرده': '/interest',
  طلا: '/gold-price',
  سکه: '/gold-price',
  ارز: '/currency-converter',
  دلار: '/currency-converter',
  یورو: '/currency-converter',
  آدرس: '/text-tools/address-converter',
  ملی: '/tools/national-id-validation',
  شبا: '/tools/iban-generator',
  'شماره شبا': '/tools/iban-generator',
  'کد پستی': '/tools/postal-code',
  'روز هفته': '/date-tools/weekday-finder',
  'تبدیل تاریخ': '/date-tools/shamsi-gregorian',
  'اختلاف تاریخ': '/date-tools/date-difference',
  تقویم: '/date-tools/holidays',
  عیدی: '/tools/eidi-calculator',
  سن: '/date-tools/age-calculator',
  ' QR Code': '/tools/qr-code',
  پس‌زمینه: '/image-tools/background-remover',
  'تبدیل فرمت': '/image-tools/image-format-converter',
  'تغییر سایز': '/image-tools/resize-image',
  فشرده‌سازی: '/pdf-tools/compress/compress-pdf',
  ترکیب: '/pdf-tools/merge/merge-pdf',
  جداسازی: '/pdf-tools/split/split-pdf',
  'تبدیل PDF': '/pdf-tools/converter/pdf-to-word',
  مالی: '/salary',
  محاسبه: '/loan',
  'بازار کار': '/career-tools/resume-builder',
  فریلنسر: '/business-tools/invoice-builder',
  فاکتور: '/business-tools/invoice-builder',
  رسید: '/business-tools/receipt-builder',
  پیش‌فاکتور: '/business-tools/proforma-invoice',
  'قرارداد اجاره': '/contract-tools/rental-contract',
  مبایعه: '/contract-tools/vehicle-sale',
  پیمانکاری: '/contract-tools/contractor-agreement',
  سالن: '/contract-tools/salon-contract',
  خودرو: '/contract-tools/vehicle-sale',
};

function getToolUrl(tags, category, title) {
  const allText = [...tags, category, title].join(' ').toLowerCase();

  for (const [keyword, url] of Object.entries(toolPageMap)) {
    if (allText.includes(keyword.toLowerCase())) {
      return url;
    }
  }

  // Default fallback based on category
  if (category === 'مالی') return '/salary';
  if (category === 'ابزار') return '/tools';
  if (category === 'آموزشی') return '/writing-tools/persian-writing-studio';
  if (category === 'حقوقی') return '/contract-tools';
  return '/tools';
}

function getSlugFromFilename(filename) {
  return filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
}

let updated = 0;
let skipped = 0;

const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));

for (const file of files) {
  const filePath = path.join(BLOG_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has coverImage
  if (content.includes('coverImage:')) {
    skipped++;
    continue;
  }

  // Parse frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) {
    skipped++;
    continue;
  }

  const fm = fmMatch[1];

  // Extract fields
  const titleMatch = fm.match(/title:\s*['"](.+?)['"]/);
  const categoryMatch = fm.match(/category:\s*['"](.+?)['"]/);
  const tagsMatch = fm.match(/tags:\s*\[([^\]]+)\]/);

  const title = titleMatch ? titleMatch[1] : '';
  const category = categoryMatch ? categoryMatch[1] : 'ابزار';
  const tags = tagsMatch ? tagsMatch[1].split(',').map((t) => t.trim().replace(/['"]/g, '')) : [];

  const slug = getSlugFromFilename(file);
  const toolUrl = getToolUrl(tags, category, title);

  // Generate coverAlt and imageCaption
  const coverAlt = `ابزار ${title.split(':')[0].substring(0, 50)} در جعبه ابزار فارسی`;
  const imageCaption = `راهنمای استفاده از ${title.split(':')[0].substring(0, 50)}`;

  // Insert coverImage fields
  const insertPoint = fmMatch.index + fmMatch[0].length;
  const newFields = `\ncoverImage: '/images/blog/${slug}/cover.webp'\ncoverAlt: '${coverAlt}'\nimageCaption: '${imageCaption}'\nreviewedBy: null\nreviewedDate: null`;

  content = content.slice(0, insertPoint) + newFields + content.slice(insertPoint);

  fs.writeFileSync(filePath, content, 'utf8');
  updated++;

  if (updated % 20 === 0) {
    console.log(`Updated ${updated} articles...`);
  }
}

console.log(`\nDone: ${updated} updated, ${skipped} skipped`);
