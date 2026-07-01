import SiteShell from '@/components/ui/SiteShell';
import Script from 'next/script';
import { buildMetadata } from '@/lib/seo';
import { buildTopicJsonLd } from '@/lib/seo-tools';
import {
  categoryGroups,
  getCategoriesByGroup,
  getCategoryCatalogEntry,
} from '@/lib/category-catalog';
import {
  getCategories,
  getCategoryDisplayEntries,
  getToolCountForDisplay,
} from '@/lib/tools-registry';
import { getCspNonce } from '@/lib/csp';
import Link from 'next/link';
import { toPersianNumbers } from '@/shared/utils/localization/persian';

export const metadata = buildMetadata({
  title: 'موضوعات و خوشه‌های ابزار - جعبه ابزار فارسی',
  description:
    'نقشه موضوعی ابزارها و خوشه‌های مرتبط برای دسترسی سریع‌تر. ابزارهای مالی، PDF، تصویر، متن، قرارداد و اسناد حرفه‌ای.',
  keywords: [
    'ابزارهای آنلاین',
    'دسته بندی ابزارها',
    'ابزار مالی',
    'ابزار PDF',
    'ابزار تصویر',
    'ابزار تاریخ',
    'ابزار قرارداد',
    'فاکتورساز',
    'رزومه‌ساز',
  ],
  path: '/topics',
});

export default async function TopicsPage() {
  const categories = getCategories();
  const faq = [
    {
      question: 'چطور ابزار مورد نظرم را پیدا کنم؟',
      answer:
        'از گروه‌های زیر استفاده کنید، وارد هر دسته شوید یا از جستجوی بالای صفحه اصلی کمک بگیرید.',
    },
    {
      question: 'آیا همه ابزارها رایگان هستند؟',
      answer: 'بله، ابزارهای پایه رایگان و بدون نیاز به ثبت‌نام هستند.',
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
      <header className="space-y-4">
        <h1 className="text-3xl font-black text-[var(--text-primary)]">همه ابزارها</h1>
        <p className="text-[var(--text-secondary)] leading-7">
          {toPersianNumbers(categories.length)} دسته‌بندی در{' '}
          {toPersianNumbers(categoryGroups.length)} گروه موضوعی — مجموع{' '}
          {toPersianNumbers(getToolCountForDisplay())} ابزار رایگان و آنلاین
        </p>
        <div className="flex flex-wrap gap-2">
          {categoryGroups.map((group) => (
            <span
              key={group.id}
              className="rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]"
            >
              {group.title}
            </span>
          ))}
        </div>
      </header>

      <div className="space-y-10">
        {categoryGroups.map((group) => {
          const entries = getCategoriesByGroup(group.id);
          if (entries.length === 0) {
            return null;
          }

          return (
            <section key={group.id} className="space-y-6">
              <div className="space-y-1 border-b border-[var(--border-light)] pb-3">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">{group.title}</h2>
                <p className="text-sm text-[var(--text-muted)]">{group.description}</p>
              </div>

              {entries.map((entry) => {
                const tools = getCategoryDisplayEntries(entry.id);
                if (tools.length === 0) {
                  return null;
                }
                const catalog = getCategoryCatalogEntry(entry.id);

                return (
                  <div
                    key={entry.id}
                    className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-4"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[rgb(var(--color-primary-rgb)/0.08)] text-xl">
                        {catalog?.icon ?? '🔧'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-[var(--text-primary)]">
                          {catalog?.shortName ?? entry.id}
                        </h3>
                        {catalog?.description ? (
                          <p className="text-sm text-[var(--text-muted)] mt-0.5">
                            {catalog.description}
                          </p>
                        ) : null}
                      </div>
                      <Link
                        href={entry.topicsPath}
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
          );
        })}
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">سؤالات متداول</h2>
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
