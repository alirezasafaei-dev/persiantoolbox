import { getCspNonce } from '@/lib/csp';
import { buildToolJsonLd } from '@/lib/seo-tools';
import type { ToolEntry } from '@/lib/tools-registry';

type Props = {
  tool: ToolEntry;
  includeStructuredData?: boolean;
};

type JsonLdNode = Record<string, unknown>;

export default async function ToolSeoContent({ tool, includeStructuredData }: Props) {
  const shouldIncludeStructuredData = includeStructuredData ?? tool.kind !== 'tool';
  const source = shouldIncludeStructuredData ? (buildToolJsonLd(tool) as JsonLdNode) : null;
  const sourceGraph = Array.isArray(source?.['@graph']) ? (source?.['@graph'] as JsonLdNode[]) : [];
  const graph = sourceGraph.filter((node) => node['@type'] !== 'BreadcrumbList');
  const nonce = graph.length > 0 ? await getCspNonce() : null;
  const jsonLd =
    graph.length > 0
      ? {
          '@context': 'https://schema.org',
          '@graph': graph,
        }
      : null;
  const serialized = jsonLd ? JSON.stringify(jsonLd).replace(/</g, '\\u003c') : null;

  if (!tool.content && !serialized) {
    return null;
  }

  const { intro, sections, steps, tips, faq } = tool.content ?? {
    intro: '',
    sections: [],
    steps: [],
    tips: [],
    faq: [],
  };

  return (
    <>
      {serialized ? (
        <script
          id={`tool-collection-structured-data-${tool.id}`}
          type="application/ld+json"
          nonce={nonce ?? undefined}
          dangerouslySetInnerHTML={{ __html: serialized }}
        />
      ) : null}

      {tool.content ? (
        <section className="mt-12 space-y-10">
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">راهنمای سریع</h2>
            <p className="leading-7 text-[var(--text-secondary)]">{intro}</p>
          </section>

          {sections && sections.length > 0 ? (
            <section className="space-y-6">
              {sections.map((section) => (
                <article key={section.heading} className="space-y-3">
                  <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                    {section.heading}
                  </h3>
                  <div className="space-y-3 leading-7 text-[var(--text-secondary)]">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </article>
              ))}
            </section>
          ) : null}

          {steps && steps.length > 0 ? (
            <section className="space-y-3">
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                مراحل استفاده از ابزار
              </h3>
              <ol className="list-decimal space-y-2 ps-6 text-[var(--text-secondary)]">
                {steps.map((step) => (
                  <li key={step} className="leading-7">
                    {step}
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {tips && tips.length > 0 ? (
            <section className="space-y-3">
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">نکات مهم</h3>
              <ul className="list-disc space-y-2 ps-6 text-[var(--text-secondary)]">
                {tips.map((tip) => (
                  <li key={tip} className="leading-7">
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {faq && faq.length > 0 ? (
            <section className="space-y-3">
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">سوالات متداول</h3>
              <div className="space-y-3">
                {faq.map((item) => (
                  <details
                    key={item.question}
                    className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3"
                  >
                    <summary className="cursor-pointer font-semibold text-[var(--text-primary)]">
                      {item.question}
                    </summary>
                    <p className="mt-2 leading-7 text-[var(--text-secondary)]">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ) : null}
        </section>
      ) : null}
    </>
  );
}
