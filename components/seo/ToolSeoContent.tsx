import Script from 'next/script';
import { buildToolJsonLd } from '@/lib/seo-tools';
import { getCspNonce } from '@/lib/csp';
import type { ToolEntry } from '@/lib/tools-registry';

type Props = {
  tool: ToolEntry;
};

export default async function ToolSeoContent({ tool }: Props) {
  if (!tool.content) {
    return null;
  }

  const nonce = await getCspNonce();
  const { intro, sections, steps, tips, faq } = tool.content;
  const jsonLd = buildToolJsonLd(tool);

  return (
    <section className="mt-12 space-y-10">
      <Script
        id={`tool-json-ld-${tool.id}`}
        type="application/ld+json"
        strategy="afterInteractive"
        nonce={nonce ?? undefined}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">راهنمای سریع</h2>
        <p className="text-[var(--text-secondary)] leading-7">{intro}</p>
      </section>

      {sections && sections.length > 0 && (
        <section className="space-y-6">
          {sections.map((section) => (
            <article key={section.heading} className="space-y-3">
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                {section.heading}
              </h3>
              <div className="space-y-3 text-[var(--text-secondary)] leading-7">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}

      {steps && steps.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xl font-semibold text-[var(--text-primary)]">
            مراحل استفاده از ابزار
          </h3>
          <ol className="list-decimal pr-6 space-y-2 text-[var(--text-secondary)]">
            {steps.map((step) => (
              <li key={step} className="leading-7">
                {step}
              </li>
            ))}
          </ol>
        </section>
      )}

      {tips && tips.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xl font-semibold text-[var(--text-primary)]">نکات مهم</h3>
          <ul className="list-disc pr-6 space-y-2 text-[var(--text-secondary)]">
            {tips.map((tip) => (
              <li key={tip} className="leading-7">
                {tip}
              </li>
            ))}
          </ul>
        </section>
      )}

      {faq && faq.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xl font-semibold text-[var(--text-primary)]">سوالات متداول</h3>
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
      )}
    </section>
  );
}
