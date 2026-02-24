import SiteShell from '@/components/ui/SiteShell';
import Script from 'next/script';
import { buildMetadata } from '@/lib/seo';
import { buildPillarJsonLd } from '@/lib/seo-tools';
import { getCategories, getCategoryContent, getCategoryDisplayEntries } from '@/lib/tools-registry';
import { getCspNonce } from '@/lib/csp';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Props = {
  params: { category: string };
};

export async function generateMetadata({ params }: Props) {
  const category = getCategories().find((item) => item.id === params.category);
  const content = category ? getCategoryContent(category.id) : undefined;
  if (!category) {
    return buildMetadata({
      title: 'موضوع یافت نشد - جعبه ابزار فارسی',
      description: 'موضوع مورد نظر یافت نشد.',
      path: `/topics/${params.category}`,
    });
  }

  return buildMetadata({
    title: `محور موضوع ${category.name} - جعبه ابزار فارسی`,
    description: `صفحه محوری برای ${category.name} و دسترسی به خوشه ابزارهای مرتبط.`,
    keywords: content?.keywords,
    path: `/topics/${category.id}`,
  });
}

export default async function TopicCategoryPage({ params }: Props) {
  const category = getCategories().find((item) => item.id === params.category);
  if (!category) {
    notFound();
  }

  const tools = getCategoryDisplayEntries(category.id);
  const content = getCategoryContent(category.id);
  const jsonLd = buildPillarJsonLd({
    title: `محور موضوع ${category.name} - جعبه ابزار فارسی`,
    description: `صفحه محوری برای ${category.name} و دسترسی به خوشه ابزارهای مرتبط.`,
    path: `/topics/${category.id}`,
    category: {
      name: category.name,
      path: category.path,
    },
    tools: tools.map((tool) => ({
      name: tool.title.replace(' - جعبه ابزار فارسی', ''),
      path: tool.path,
    })),
    faq: content?.faq ?? [],
  });

  const nonce = await getCspNonce();

  return (
    <SiteShell containerClassName="py-10 space-y-10">
      <Script
        id={`topics-${category.id}-json-ld`}
        type="application/ld+json"
        strategy="afterInteractive"
        nonce={nonce ?? undefined}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="space-y-3">
        <p className="text-sm text-[var(--text-muted)]">صفحه محوری موضوع</p>
        <h1 className="text-3xl font-black text-[var(--text-primary)]">{category.name}</h1>
        <p className="text-[var(--text-secondary)] leading-7">
          این صفحه محور اصلی موضوع {category.name} است و به همه ابزارهای مرتبط لینک می‌دهد. برای
          شروع، از فهرست ابزارها استفاده کنید یا به صفحه اصلی دسته بروید.
        </p>
        <Link
          href={category.path}
          className="inline-flex text-sm font-semibold text-[var(--color-primary)]"
        >
          رفتن به صفحه دسته {category.name}
        </Link>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">خوشه ابزارها</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.path}
              className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 text-[var(--text-primary)] hover:border-[var(--border-strong)]"
            >
              <div className="font-semibold">{tool.title.replace(' - جعبه ابزار فارسی', '')}</div>
              <div className="mt-2 text-sm text-[var(--text-secondary)]">{tool.description}</div>
            </Link>
          ))}
        </div>
      </section>

      {content && (
        <section className="space-y-6">
          <h3 className="text-2xl font-bold text-[var(--text-primary)]">راهنمای موضوعی</h3>
          <div className="space-y-4 text-[var(--text-secondary)] leading-7">
            {content.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {content.faq.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xl font-semibold text-[var(--text-primary)]">سوالات متداول</h4>
              <div className="space-y-3">
                {content.faq.map((item) => (
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
            </div>
          )}
        </section>
      )}

      <section className="space-y-3">
        <h3 className="text-xl font-semibold text-[var(--text-primary)]">نکات سریع</h3>
        <ul className="list-disc pr-6 space-y-2 text-[var(--text-secondary)]">
          <li className="leading-7">
            ابزارهای این خوشه مستقل از هم هستند و به صورت محلی اجرا می‌شوند.
          </li>
          <li className="leading-7">برای هر ابزار، راهنمای سریع و سوالات متداول ارائه شده است.</li>
        </ul>
      </section>
    </SiteShell>
  );
}
