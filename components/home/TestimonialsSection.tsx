import { testimonials } from '@/lib/testimonials';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`امتیاز ${rating} از ۵`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`text-sm ${i < rating ? 'text-[var(--color-warning)]' : 'text-[var(--text-muted)] opacity-30'}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="space-y-8" aria-labelledby="testimonials-heading">
      <div className="flex flex-col items-center gap-3 text-center">
        <h2
          id="testimonials-heading"
          className="text-2xl font-black text-[var(--text-primary)] sm:text-3xl"
        >
          نظرات کاربران
        </h2>
        <p className="max-w-xl text-sm leading-7 text-[var(--text-muted)]">
          کاربران واقعی ابزارهای ما را تجربه کرده‌اند و نظرات خود را به اشتراک گذاشته‌اند.
        </p>
      </div>

      <div
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        role="list"
        aria-label="نظرات کاربران"
      >
        {testimonials.map((item) => (
          <div
            key={item.name}
            role="listitem"
            className="group relative flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-subtle)] transition-all duration-[var(--motion-medium)] hover:-translate-y-0.5 hover:border-[var(--border-medium)] hover:shadow-[var(--shadow-medium)]"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--color-primary-rgb)/0.1)] text-sm font-bold text-[var(--color-primary)]"
                aria-hidden="true"
              >
                {item.initials}
              </span>
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-[var(--text-primary)]">{item.name}</span>
                <span className="block text-xs text-[var(--text-muted)]">{item.role}</span>
              </div>
            </div>

            <StarRating rating={item.rating} />

            <p className="text-sm leading-7 text-[var(--text-secondary)]">«{item.quote}»</p>

            <div className="mt-auto border-t border-[var(--border-light)] pt-3">
              <span className="inline-flex items-center rounded-full bg-[rgb(var(--color-primary-rgb)/0.06)] px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)]">
                {item.feature}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-[var(--text-muted)]">
        نظرات از کاربران فعال ابزارهای پرشین‌تول‌باکس جمع‌آوری شده‌اند.
      </p>
    </section>
  );
}
