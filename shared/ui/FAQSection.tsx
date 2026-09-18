import { cx } from './cx';

type FaqItem = {
  question: string;
  answer: string;
};

type Props = {
  title?: string;
  items: FaqItem[];
  className?: string;
};

export default function FAQSection({ title = 'سوالات متداول', items, className }: Props) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className={cx('section-surface p-6 md:p-8 lg:p-10', className)}
      aria-labelledby="faq-heading"
    >
      <h2 id="faq-heading" className="text-2xl font-black text-(--text-primary)">
        {title}
      </h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <details
            key={item.question}
            className="rounded-md border border-(--border-light) bg-(--surface-1) px-4 py-3 transition-colors hover:bg-(--surface-2)"
          >
            <summary className="cursor-pointer font-semibold text-(--text-primary)">
              {item.question}
            </summary>
            <p className="mt-2 leading-7 text-(--text-secondary)">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
