export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'سارا محمدی',
      role: 'حسابدار',
      text: 'محاسبه حقوق و مالیات با این ابزار خیلی ساده شده. قبلاً ساعت‌ها وقت صرف محاسبه می‌کردم.',
      tool: 'محاسبه حقوق',
    },
    {
      name: 'علی رضایی',
      role: 'توسعه‌دهنده',
      text: 'ابزارهای PDF عالی هستند. ادغام و فشرده‌سازی بدون نیاز به نرم‌افزار جانبی.',
      tool: 'ابزارهای PDF',
    },
    {
      name: 'مریم حسینی',
      role: 'دانشجو',
      text: 'تبدیل تاریخ شمسی به میلادی خیلی دقیق است. برای پروژه‌های دانشگاهی عالی بود.',
      tool: 'تبدیل تاریخ',
    },
  ];

  return (
    <section className="space-y-6" aria-labelledby="testimonials-heading">
      <div className="flex flex-col gap-2 text-center">
        <h2 id="testimonials-heading" className="text-2xl font-black text-[var(--text-primary)]">
          کاربران ما چه می‌گویند؟
        </h2>
        <p className="text-sm text-[var(--text-muted)]">نظرات واقعی کاربران جعبه ابزار فارسی</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((item) => (
          <div
            key={item.name}
            className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 space-y-3"
          >
            <div className="text-sm leading-6 text-[var(--text-secondary)]">
              &ldquo;{item.text}&rdquo;
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-[var(--text-primary)]">{item.name}</div>
                <div className="text-xs text-[var(--text-muted)]">{item.role}</div>
              </div>
              <span className="rounded-full border border-[var(--border-light)] bg-[var(--surface-2)] px-2.5 py-1 text-xs font-semibold text-[var(--text-muted)]">
                {item.tool}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
