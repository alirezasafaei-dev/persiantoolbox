import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import SiteShell from '@/components/ui/SiteShell';
import { getCspNonce } from '@/lib/csp';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getGuideBySlug, guidePages } from '@/lib/guide-pages';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return guidePages.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) {
    return {
      title: 'راهنما یافت نشد',
      robots: { index: false, follow: false },
    };
  }

  return buildMetadata({
    title: `${guide.title} - جعبه ابزار فارسی`,
    description: guide.summary,
    path: `/guides/${guide.slug}`,
    keywords: ['راهنمای ابزار فارسی', guide.title, 'آموزش گام‌به‌گام'],
  });
}

export default async function GuideDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  const nonce = await getCspNonce();

  if (!guide) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.summary,
    inLanguage: 'fa-IR',
    mainEntityOfPage: `${siteUrl}/guides/${guide.slug}`,
  };

  return (
    <SiteShell containerClassName="py-10">
      <article className="space-y-8 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 md:p-8">
        <header className="space-y-3">
          <Link
            href="/guides"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
          >
            <span aria-hidden="true">→</span>
            بازگشت به مرکز راهنماها
          </Link>
          <h1 className="text-3xl font-black leading-tight text-[var(--text-primary)]">
            {guide.title}
          </h1>
          <p className="text-sm leading-7 text-[var(--text-secondary)]">{guide.summary}</p>
        </header>

        <div className="space-y-5 text-[var(--text-secondary)] leading-8">
          {guide.body.split('\n\n').map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">سوالات متداول</h2>
          <div className="space-y-3">
            {guide.faq.map((item) => (
              <details
                key={item.question}
                className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3"
              >
                <summary className="cursor-pointer text-sm font-semibold text-[var(--text-primary)]">
                  {item.question}
                </summary>
                <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">لینک‌های مرتبط</h2>
          <ul className="space-y-2">
            {guide.internalLinks.map((link) => (
              <li key={link}>
                <Link
                  href={link}
                  className="inline-flex rounded-sm text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] focus-ring"
                >
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </article>

      <Script
        id={`guide-jsonld-${guide.slug}`}
        strategy="afterInteractive"
        type="application/ld+json"
        nonce={nonce ?? undefined}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </SiteShell>
  );
}
