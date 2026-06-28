import SiteShell from '@/components/ui/SiteShell';
import Script from 'next/script';
import { buildMetadata } from '@/lib/seo';
import { buildTopicJsonLd } from '@/lib/seo-tools';
import { getCategories, getCategoryDisplayEntries } from '@/lib/tools-registry';
import { getCspNonce } from '@/lib/csp';
import Link from 'next/link';
import { toPersianNumbers } from '@/shared/utils/localization/persian';

export const metadata = buildMetadata({
  title: 'موضوعات و خوشه‌های ابزار - جعبه ابزار فارسی',
  description:
    'نقشه موضوعی ابزارها و خوشه‌های مرتبط برای دسترسی سریع‌تر. ابزارهای مالی، PDF، تصویر، متن و تاریخ.',
  keywords: [
    'ابزارهای آنلاین',
    'دسته بندی ابزارها',
    'ابزار مالی',
    'ابزار PDF',
    'ابزار تصویر',
    'ابزار تاریخ',
  ],
  path: '/topics',
});

const categoryIcons: Record<string, string> = {
  'pdf-tools': '📄',
  'image-tools': '🖼️',
  'finance-tools': '💰',
  'date-tools': '📅',
  'text-tools': '✏️',
  'validation-tools': '🔐',
};

const categoryDescriptions: Record<string, string> = {
  'pdf-tools': 'ادغام، تقسیم، فشرده‌سازی، تبدیل و امنیت فایل‌های PDF',
  'image-tools': 'فشرده‌سازی، تغییر اندازه، تبدیل فرمت و OCR تصاویر',
  'finance-tools': 'محاسبه حقوق، وام، سود بانکی، مالیات و بیمه',
  'date-tools': 'تبدیل تاریخ شمسی، میلادی و قمری و محاسبه سن',
  'text-tools': 'شمارش کلمات، تبدیل عدد، نرمال‌سازی متن و OCR',
  'validation-tools': 'تولید QR Code، رمز عبور و اعتبارسنجی کد ملی',
};

export default async function TopicsPage() {
  const categories = getCategories();
  const faq = [
    {
      question: 'چطور ابزار مورد نظرم رو پیدا کنم؟',
      answer: 'از دسته‌بندی‌های زیر استفاده کنید یا از جستجوی بالای صفحه اصلی استفاده کنید.',
    },
    {
      question: 'آیا همه ابزارها رایگان هستند؟',
      answer: 'بله، تمام ابزارها رایگان و بدون نیاز به ثبت‌نام هستند.',
    },
    {
      question: 'آیا اطلاعات من ذخیره می‌شود؟',
      answer: 'خیر، تمام پردازش‌ها در مرورگر انجام می‌شود و داده‌ای به سرور ارسال نمی‌شود.',
    },
  ];
  const jsonLd = buildTopicJsonLd({
    title: 'موضوعات و خوشه‌های ابزار - جعبه ابزار فارسی',
    description: 'نقشه موضوعی ابزارها و خوشه‌های مرتبط برای دسترسی سریع‌تر',
    path: '/topics',
    categories: categories.map((category) => ({
      name: category.name,
      path: `/topics/${category.id}`,
      tools: getCategoryDisplayEntries(category.id).map((tool) => ({
        name: tool.title.replace(' - جعبه ابزار فارسی', ''),
        path: tool.path,
      })),
    })),
    faq,
  });

  const nonce = await getCspNonce();

  return (
    <SiteShell containerClassName="py-10 space-y-10">
      <Script
        id="topics-json-ld"
        type="application/ld+json"
        strategy="afterInteractive"
        nonce={nonce ?? undefined}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="space-y-3">
        <h1 className="text-3xl font-black text-[var(--text-primary)]">همه ابزارها</h1>
        <p className="text-[var(--text-secondary)] leading-7">
          {toPersianNumbers(categories.length)} دسته‌بندی با مجموع{' '}
          {toPersianNumbers(
            categories.reduce((sum, cat) => sum + getCategoryDisplayEntries(cat.id).length, 0),
          )}{' '}
          ابزار رایگان و آنلاین
        </p>
      </header>

      <section className="space-y-6">
        {categories.map((category) => {
          const tools = getCategoryDisplayEntries(category.id);
          if (tools.length === 0) {
            return null;
          }
          const icon = categoryIcons[category.id] ?? '🔧';
          const desc = categoryDescriptions[category.id] ?? '';

          return (
            <div
              key={category.id}
              className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-4"
            >
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[rgb(var(--color-primary-rgb)/0.08)] text-xl">
                  {icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">{category.name}</h2>
                  {desc ? <p className="text-sm text-[var(--text-muted)] mt-0.5">{desc}</p> : null}
                </div>
                <Link
                  href={`/topics/${category.id}`}
                  prefetch={false}
                  className="btn btn-secondary btn-sm"
                >
                  مشاهده همه ({toPersianNumbers(tools.length)})
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tools.slice(0, 6).map((tool) => (
                  <Link
                    key={tool.id}
                    href={tool.path}
                    prefetch={false}
                    className="group rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] p-3 transition-all duration-200 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-subtle)]"
                  >
                    <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                      {tool.title.replace(' - جعبه ابزار فارسی', '')}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-1 line-clamp-1">
                      {tool.description}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[var(--text-primary])">سؤالات متداول</h2>
        <div className="space-y-3">
          {faq.map((item) => (
            <details
              key={item.question}
              className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3"
            >
              <summary className="cursor-pointer text-[var(--text-primary)] font-semibold">
                {item.question}
              </summary>
              <p className="mt-2 text-[var(--text-secondary)] leading-7">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
