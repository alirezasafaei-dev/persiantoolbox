import type { CategoryContent } from '@/lib/tools-registry';
import FAQSection from '@/shared/ui/FAQSection';

type Props = {
  categoryContent: CategoryContent;
  guideTitle: string;
};

export default function CategoryGuideSection({ categoryContent, guideTitle }: Props) {
  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-[var(--text-primary)]">{guideTitle}</h2>
        <div className="space-y-4 text-[var(--text-secondary)] leading-7">
          {categoryContent.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
      {categoryContent.faq.length > 0 && <FAQSection items={categoryContent.faq} />}
    </section>
  );
}
