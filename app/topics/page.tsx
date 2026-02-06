import Container from '@/components/ui/Container';
import Navigation from '@/components/ui/Navigation';
import Footer from '@/components/ui/Footer';
import Script from 'next/script';
import { buildMetadata } from '@/lib/seo';
import { buildTopicJsonLd } from '@/lib/seo-tools';
import { getCategories, getCategoryContent, getToolsByCategory } from '@/lib/tools-registry';
import { getCspNonce } from '@/lib/csp';
import Link from 'next/link';

export const metadata = buildMetadata({
  title: 'موضوعات و خوشه‌های ابزار - جعبه ابزار فارسی',
  description: 'نقشه موضوعی ابزارها و خوشه‌های مرتبط برای دسترسی سریع‌تر',
  keywords: [
    'خوشه موضوعی',
    'صفحه Pillar',
    'ابزارهای آنلاین',
    'دسته بندی ابزارها',
    'موضوعات ابزار',
    'راهنمای ابزارها',
  ],
  path: '/topics',
});

export default async function TopicsPage() {
  const categories = getCategories();
  const faq = [
    {
      question: 'صفحه Pillar چیست و چه کاربردی دارد؟',
      answer:
        'صفحه Pillar محور اصلی یک موضوع است و به همه ابزارهای مرتبط لینک می‌دهد تا دسترسی سریع‌تر باشد.',
    },
    {
      question: 'خوشه موضوعی چه مزیتی دارد؟',
      answer:
        'خوشه‌ها کمک می‌کنند ابزارهای مرتبط کنار هم قرار بگیرند و مسیر استفاده برای کاربران واضح‌تر شود.',
    },
    {
      question: 'آیا همه ابزارها در خوشه‌ها قرار دارند؟',
      answer: 'بله، هر ابزار در یک خوشه موضوعی قرار گرفته است تا پیدا کردن آن آسان‌تر باشد.',
    },
  ];
  const jsonLd = buildTopicJsonLd({
    title: 'موضوعات و خوشه‌های ابزار - جعبه ابزار فارسی',
    description: 'نقشه موضوعی ابزارها و خوشه‌های مرتبط برای دسترسی سریع‌تر',
    path: '/topics',
    categories: categories.map((category) => ({
      name: category.name,
      path: `/topics/${category.id}`,
      tools: getToolsByCategory(category.id).map((tool) => ({
        name: tool.title.replace(' - جعبه ابزار فارسی', ''),
        path: tool.path,
      })),
    })),
    faq,
  });

  const nonce = await getCspNonce();

  return (
    <div className="min-h-dvh flex flex-col page-shell">
      <Navigation />

      <main className="flex-1">
        <Container className="py-10 space-y-10">
          <Script
            id="topics-json-ld"
            type="application/ld+json"
            strategy="afterInteractive"
            nonce={nonce ?? undefined}
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <header className="space-y-3">
            <h1 className="text-3xl font-black text-[var(--text-primary)]">موضوعات و خوشه‌ها</h1>
            <p className="text-[var(--text-secondary)] leading-7">
              در این صفحه نقشه موضوعی ابزارها را می‌بینید. هر موضوع شامل مجموعه‌ای از ابزارهای مرتبط
              است تا سریع‌تر به پاسخ برسید.
            </p>
          </header>

          <section className="space-y-8">
            {categories.map((category) => {
              const tools = getToolsByCategory(category.id);
              const content = getCategoryContent(category.id);
              if (tools.length === 0) {
                return null;
              }
              return (
                <div
                  key={category.id}
                  className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                      {category.name}
                    </h2>
                    <Link
                      href={`/topics/${category.id}`}
                      className="text-sm font-semibold text-[var(--color-primary)]"
                    >
                      مشاهده صفحه Pillar
                    </Link>
                  </div>
                  <p className="text-[var(--text-secondary)]">
                    ابزارهای مرتبط با {category.name} برای حل سریع‌تر کارهای تخصصی شما.
                  </p>
                  {content && (
                    <div className="space-y-2 text-sm text-[var(--text-secondary)] leading-6">
                      {content.paragraphs.slice(0, 1).map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {tools.map((tool) => (
                      <Link
                        key={tool.id}
                        href={tool.path}
                        className="rounded-full border border-[var(--border-light)] bg-[var(--surface-2)] px-3 py-1 text-sm text-[var(--text-primary)] hover:border-[var(--border-strong)]"
                      >
                        {tool.title.replace(' - جعبه ابزار فارسی', '')}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">سوالات متداول</h2>
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
        </Container>
      </main>

      <Footer />
    </div>
  );
}
