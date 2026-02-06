type Props = {
  title: string;
  description?: string;
};

export default function PdfToolPlaceholder({ title, description }: Props) {
  return (
    <div className="max-w-3xl mx-auto rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-8 text-center">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h1>
      <p className="mt-3 text-[var(--text-secondary)]">
        {description ?? 'این ابزار در حال توسعه است و به زودی فعال می شود.'}
      </p>
    </div>
  );
}
