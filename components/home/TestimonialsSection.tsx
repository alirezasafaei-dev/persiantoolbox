export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'مسیر مالی و اداری',
      role: 'کاربران حسابداری، حقوق و وام',
      text: 'بیشترین بازگشت کاربران این بخش برای محاسبه حقوق، مالیات، وام و بررسی هزینه‌های ماهانه است.',
      tool: 'ابزارهای مالی',
    },
    {
      name: 'مسیر فایل و PDF',
      role: 'کاربران اسناد و فایل',
      text: 'فشرده‌سازی، ادغام و تبدیل PDF هنوز جزو پرتکرارترین کارهایی است که کاربران برای آن برمی‌گردند.',
      tool: 'PDF و فایل',
    },
    {
      name: 'مسیر متن و بهره‌وری',
      role: 'دانشجو، کارمند و تیم محتوا',
      text: 'اصلاح متن فارسی، تبدیل تاریخ و ساخت سندهای روزمره، سه نیاز پرتکرار در استفاده روزانه از سایت هستند.',
      tool: 'متن و تاریخ',
    },
  ];

  return (
    <section className="space-y-6" aria-labelledby="testimonials-heading">
      <div className="flex flex-col gap-2 text-center">
        <h2 id="testimonials-heading" className="text-2xl font-black text-[var(--text-primary)]">
          کاربران بیشتر برای چه کارهایی برمی‌گردند؟
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          این بخش فعلاً خلاصه‌ای از الگوهای پرتکرار استفاده است؛ testimonial واقعی بعد از جمع‌آوری و
          تأیید از پشتیبانی و تلگرام جایگزین می‌شود.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((item) => (
          <div
            key={item.name}
            className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 space-y-3"
          >
            <p className="text-sm leading-6 text-[var(--text-secondary)]">{item.text}</p>
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
