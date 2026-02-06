import Link from 'next/link';
import Container from '@/shared/ui/Container';
import {
  IconPdf,
  IconImage,
  IconCalculator,
  IconShield,
  IconZap,
  IconHeart,
  IconCalendar,
} from '@/shared/ui/icons';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-light)] bg-[var(--bg-secondary)] text-[var(--text-primary)]">
      <div className="border-b border-[var(--border-light)]">
        <Container className="py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white">
                  <span className="text-lg font-bold">P</span>
                </span>
                <span className="text-xl font-black">جعبه ابزار فارسی</span>
              </div>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-md">
                مجموعه‌ای کامل از ابزارهای آنلاین برای کار با فایل‌ها، محاسبات مالی و تبدیل فرمت‌ها.
                تمام ابزارها کاملاً رایگان و امن هستند.
              </p>

              <div className="grid gap-3">
                {[
                  {
                    icon: IconShield,
                    title: 'امن و خصوصی',
                    desc: 'پردازش فقط روی دستگاه شما',
                    tone: 'text-[var(--color-success)] bg-[rgb(var(--color-success-rgb)/0.12)]',
                  },
                  {
                    icon: IconZap,
                    title: 'سریع و کارآمد',
                    desc: 'پردازش سریع با بهترین الگوریتم‌ها',
                    tone: 'text-[var(--color-info)] bg-[rgb(var(--color-info-rgb)/0.12)]',
                  },
                  {
                    icon: IconHeart,
                    title: 'کاملاً رایگان',
                    desc: 'بدون هزینه و محدودیت',
                    tone: 'text-[var(--color-warning)] bg-[rgb(var(--color-warning-rgb)/0.12)]',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${item.tone}`}
                    >
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[var(--text-primary)]">
                        {item.title}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 flex items-center gap-2 font-bold text-[var(--text-primary)]">
                <IconPdf className="h-5 w-5 text-[var(--color-danger)]" />
                ابزارهای PDF
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/pdf-tools"
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    همه ابزارهای PDF
                  </Link>
                </li>
                <li>
                  <span className="text-sm text-[var(--text-muted)]/80">تبدیل عکس به PDF</span>
                </li>
                <li>
                  <span className="text-sm text-[var(--text-muted)]/80">فشرده‌سازی PDF</span>
                </li>
                <li>
                  <span className="text-sm text-[var(--text-muted)]/80">ادغام و تقسیم PDF</span>
                </li>
                <li>
                  <span className="text-sm text-[var(--text-muted)]/80">رمزگذاری و واترمارک</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 flex items-center gap-2 font-bold text-[var(--text-primary)]">
                <IconImage className="h-5 w-5 text-[var(--color-info)]" />
                ابزارهای تصویر
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/image-tools"
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    فشرده‌سازی و بهینه‌سازی
                  </Link>
                </li>
                <li>
                  <span className="text-sm text-[var(--text-muted)]/80">
                    تغییر اندازه عکس (به زودی)
                  </span>
                </li>
                <li>
                  <span className="text-sm text-[var(--text-muted)]/80">تبدیل فرمت (به زودی)</span>
                </li>
                <li>
                  <span className="text-sm text-[var(--text-muted)]/80">برش عکس (به زودی)</span>
                </li>
                <li>
                  <span className="text-sm text-[var(--text-muted)]/80">
                    افزودن واترمارک (به زودی)
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 flex items-center gap-2 font-bold text-[var(--text-primary)]">
                <IconCalculator className="h-5 w-5 text-[var(--color-primary)]" />
                ابزارهای مالی
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/loan"
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    محاسبه‌گر وام
                  </Link>
                </li>
                <li>
                  <Link
                    href="/salary"
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    محاسبه‌گر حقوق
                  </Link>
                </li>
                <li>
                  <span className="text-sm text-[var(--text-muted)]/80">
                    محاسبه‌گر سود (به زودی)
                  </span>
                </li>
                <li>
                  <span className="text-sm text-[var(--text-muted)]/80">تبدیل ارز (به زودی)</span>
                </li>
                <li>
                  <span className="text-sm text-[var(--text-muted)]/80">
                    محاسبه‌گر مالیات (به زودی)
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 flex items-center gap-2 font-bold text-[var(--text-primary)]">
                <IconCalendar className="h-5 w-5 text-[var(--color-warning)]" />
                ابزارهای تاریخ
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/date-tools"
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    تبدیل شمسی ↔ میلادی
                  </Link>
                </li>
                <li>
                  <span className="text-sm text-[var(--text-muted)]/80">محاسبه سن</span>
                </li>
                <li>
                  <span className="text-sm text-[var(--text-muted)]/80">اختلاف دو تاریخ</span>
                </li>
                <li>
                  <span className="text-sm text-[var(--text-muted)]/80">روز هفته</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 flex items-center gap-2 font-bold text-[var(--text-primary)]">
                <IconZap className="h-5 w-5 text-[var(--color-info)]" />
                ابزارهای متنی
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/text-tools"
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    تبدیل عدد به حروف
                  </Link>
                </li>
                <li>
                  <span className="text-sm text-[var(--text-muted)]/80">شمارش کلمات</span>
                </li>
                <li>
                  <span className="text-sm text-[var(--text-muted)]/80">تبدیل تاریخ</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 flex items-center gap-2 font-bold text-[var(--text-primary)]">
                <IconShield className="h-5 w-5 text-[var(--color-success)]" />
                اعتبارسنجی داده‌ها
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/validation-tools"
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    کد ملی و موبایل
                  </Link>
                </li>
                <li>
                  <span className="text-sm text-[var(--text-muted)]/80">کارت بانکی و شبا</span>
                </li>
                <li>
                  <span className="text-sm text-[var(--text-muted)]/80">کدپستی و پلاک</span>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </div>

      <div className="bg-[var(--surface-1)]/75">
        <Container className="py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-[var(--text-muted)]">
              © {new Date().getFullYear()} جعبه ابزار فارسی. تمام حقوق محفوظ است.
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-[var(--text-muted)]">
              <span>ساخته شده با ❤️ برای کاربران فارسی‌زبان</span>
              <Link
                href="/dashboard"
                className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                داشبورد استفاده
              </Link>
              <Link
                href="/account"
                className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                حساب کاربری
              </Link>
              <Link
                href="/support"
                className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                حمایت مالی
              </Link>
              <Link
                href="/ads"
                className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                شفافیت تبلیغات
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                حریم خصوصی
              </Link>
              <Link
                href="/plans"
                className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                پلن‌های اشتراک
              </Link>
              <Link
                href="/subscription-roadmap"
                className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                نقشه‌راه اشتراک
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--border-light)] text-center">
            <p className="text-xs text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-1">
                <IconShield className="h-3 w-3" />
                پردازش‌ها کاملاً روی دستگاه شما انجام می‌شود و چیزی به سرور ارسال نمی‌گردد.
              </span>
            </p>
          </div>
        </Container>
      </div>
    </footer>
  );
}
