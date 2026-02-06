import ValidationToolsPage from '@/components/features/validation-tools/ValidationToolsPage';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getCategoryContent, getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/validation-tools');
const categoryContent = getCategoryContent('validation-tools');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: categoryContent?.keywords ?? tool.keywords,
  path: tool.path,
});

export default function ValidationToolsRoute() {
  return (
    <div className="space-y-10">
      <ValidationToolsPage />
      {categoryContent && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            راهنمای موضوعی اعتبارسنجی
          </h2>
          <div className="space-y-4 text-[var(--text-secondary)] leading-7">
            {categoryContent.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {categoryContent.faq.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">سوالات متداول</h3>
              <div className="space-y-3">
                {categoryContent.faq.map((item) => (
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
      <ToolSeoContent tool={tool} />
    </div>
  );
}
