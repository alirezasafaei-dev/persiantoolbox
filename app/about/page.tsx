import Link from 'next/link';
import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';
import { BRAND } from '@/lib/brand';
import { getAllPosts } from '@/lib/blog';
import { FREE_TOOLS_DISPLAY_COUNT_LABEL, getCategories } from '@/lib/tools-registry';
import { toPersianNumbers } from '@/shared/utils/localization/persian';

export const metadata = buildMetadata({
  title: 'درباره ما - جعبه ابزار فارسی',
  description:
    'درباره ماموریت، معماری local-first و استانداردهای جعبه ابزار فارسی. ابزارهای آنلاین رایگان برای کاربران فارسی‌زبان.',
  path: '/about',
  keywords: ['درباره جعبه ابزار فارسی', 'تیم جعبه ابزار فارسی', 'ابزار آنلاین فارسی'],
});

export default function AboutRoute() {
  const categoriesCount = getCategories().length;
  const postsCount = getAllPosts().length;

  const performanceStats = [
    { number: FREE_TOOLS_DISPLAY_COUNT_LABEL, label: 'ابزار رایگان' },
    { number: toPersianNumbers(categoriesCount), label: 'دسته‌بندی' },
    { number: toPersianNumbers(postsCount), label: 'مقاله آموزشی' },
    { number: '۱۰۰٪', label: 'پردازش محلی' },
  ];

  return (
    <SiteShell containerClassName="py-10 space-y-8">
      <header className="section-surface p-6 md:p-8 space-y-3">
        <h1 className="text-3xl font-black text-[var(--text-primary)]">درباره جعبه ابزار فارسی</h1>
        <p className="text-[var(--text-secondary)] leading-7">
          {BRAND.siteName} یک مجموعه ابزار آنلاین فارسی با رویکرد local-first است. هدف ما ارائه
          ابزارهای سریع، شفاف و قابل اتکا برای نیازهای روزمره کاربران فارسی‌زبان است.
        </p>
      </header>

      <section className="section-surface p-6 md:p-8 space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">چرا جعبه ابزار فارسی؟</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-7">
          ما باور داریم هر کاربر فارسی‌زبان حق دارد ابزارهای دیجیتال رایگان، امن و با کیفیت در
          اختیار داشته باشد. بیشتر ابزارهای آنلاین یا فارسی نیستند یا حریم خصوصی شما را حفظ
          نمی‌کنند. جعبه ابزار فارسی برای پر کردن این خلاط ساخته شده است.
        </p>
      </section>

      <section className="section-surface p-6 md:p-8 space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">اصول محصول</h2>
        <ul className="grid gap-3 md:grid-cols-3">
          <li className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 text-sm text-[var(--text-secondary)] leading-7">
            <span className="font-semibold text-[var(--text-primary)]">🔒 اولویت حریم خصوصی</span>
            <p className="mt-2">
              محاسبات و پردازش‌ها تا حد امکان در مرورگر کاربر انجام می‌شود. فایل‌ها و داده‌های شما
              هرگز به سرور ارسال نمی‌شوند.
            </p>
          </li>
          <li className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 text-sm text-[var(--text-secondary)] leading-7">
            <span className="font-semibold text-[var(--text-primary)]">⚡ سرعت و عملکرد</span>
            <p className="mt-2">
              وابستگی runtime به سرویس‌های خارجی به صفر نزدیک نگه داشته می‌شود. ابزارها بدون تأخیر
              شبکه اجرا می‌شوند.
            </p>
          </li>
          <li className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 text-sm text-[var(--text-secondary)] leading-7">
            <span className="font-semibold text-[var(--text-primary)]">📱 تجربه یکدست</span>
            <p className="mt-2">
              رابط کاربری ساده، سریع و قابل استفاده روی موبایل و دسکتاپ با پشتیبانی کامل RTL طراحی
              می‌شود.
            </p>
          </li>
        </ul>
      </section>

      <section className="section-surface p-6 md:p-8 space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">ابزارها و امکانات</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-7">
          {BRAND.siteName} شامل مجموعه‌ای جامع از ابزارهای کاربردی در دسته‌بندی‌های مختلف است:
        </p>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/tools"
            className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 hover:border-[var(--color-primary)] transition-colors"
          >
            <div className="text-sm font-bold text-[var(--color-primary)]">💰 ابزارهای مالی</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              محاسبه حقوق، وام، سود بانکی و مالیات
            </div>
          </Link>
          <Link
            href="/pdf-tools"
            className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 hover:border-[var(--color-primary)] transition-colors"
          >
            <div className="text-sm font-bold text-[var(--color-primary)]">📄 ابزارهای PDF</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              ادغام، تقسیم، فشرده‌سازی و تبدیل PDF
            </div>
          </Link>
          <Link
            href="/image-tools"
            className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 hover:border-[var(--color-primary)] transition-colors"
          >
            <div className="text-sm font-bold text-[var(--color-primary)]">🖼️ ابزارهای تصویر</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              فشرده‌سازی، تغییر اندازه و OCR
            </div>
          </Link>
          <Link
            href="/date-tools"
            className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 hover:border-[var(--color-primary)] transition-colors"
          >
            <div className="text-sm font-bold text-[var(--color-primary)]">📅 ابزارهای تاریخ</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              تبدیل تاریخ شمسی، میلادی و قمری
            </div>
          </Link>
          <Link
            href="/text-tools"
            className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 hover:border-[var(--color-primary)] transition-colors"
          >
            <div className="text-sm font-bold text-[var(--color-primary)]">✏️ ابزارهای متنی</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              شمارش کلمات، تبدیل اعداد و ویرایش متن
            </div>
          </Link>
          <Link
            href="/validation-tools"
            className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 hover:border-[var(--color-primary)] transition-colors"
          >
            <div className="text-sm font-bold text-[var(--color-primary)]">
              🔐 ابزارهای اعتبارسنجی
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              کد ملی، شماره کارت، QR Code و رمز عبور
            </div>
          </Link>
          <Link
            href="/business-tools"
            className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 hover:border-[var(--color-primary)] transition-colors"
          >
            <div className="text-sm font-bold text-[var(--color-primary)]">
              🧾 ابزارهای کسب‌وکار
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              فاکتورساز، رسیدساز و پیش‌فاکتور
            </div>
          </Link>
          <Link
            href="/career-tools"
            className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 hover:border-[var(--color-primary)] transition-colors"
          >
            <div className="text-sm font-bold text-[var(--color-primary)]">📄 ابزارهای شغلی</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              رزومه‌ساز حرفه‌ای فارسی و انگلیسی
            </div>
          </Link>
          <Link
            href="/writing-tools"
            className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 hover:border-[var(--color-primary)] transition-colors"
          >
            <div className="text-sm font-bold text-[var(--color-primary)]">✏️ ابزارهای نگارش</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              ویرایشگر فارسی، اصلاح حروف و نیم‌فاصله
            </div>
          </Link>
          <Link
            href="/contract-tools"
            className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 hover:border-[var(--color-primary)] transition-colors"
          >
            <div className="text-sm font-bold text-[var(--color-primary)]">📝 ابزارهای قرارداد</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              قرارداد اجاره و پیمانکاری ساختمان
            </div>
          </Link>
        </div>
      </section>

      <section className="section-surface p-6 md:p-8 space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">آمار عملکرد</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {performanceStats.map((item) => (
            <div
              key={item.label}
              className="text-center p-4 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)]"
            >
              <div className="text-2xl font-black text-[var(--color-primary)]">{item.number}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-surface p-6 md:p-8 space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">توسعه‌دهنده</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-7">
          جعبه ابزار فارسی توسط علیرضا صفائی، مهندس سیستم‌های وب، طراحی و توسعه داده شده است. تمام
          کدها در GitHub متن‌باز است و هر کسی می‌تواند مشارکت کند.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://github.com/alirezasafaei-dev/persiantoolbox"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
          >
            GitHub
          </a>
          <a
            href="https://alirezasafaeisystems.ir"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
          >
            پورتفولیو
          </a>
        </div>
      </section>

      <section className="section-surface p-6 md:p-8 space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">شفافیت</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-7">
          ما متعهد به شفافیت کامل هستیم. تمام پردازش‌ها در مرورگر شما انجام می‌شود و فایل‌های شما
          هرگز به سرور ارسال نمی‌شوند. حتی تیم فنی ما هم به داده‌های شما دسترسی ندارد.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/trust" className="btn btn-secondary btn-sm">
            شفافیت فنی
          </Link>
          <Link href="/privacy" className="btn btn-secondary btn-sm">
            سیاست حریم خصوصی
          </Link>
        </div>
      </section>

      <section className="section-surface p-6 md:p-8 space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">محدودیت‌ها</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-7">
          ابزارهای ما جایگزین مشاوره حرفه‌ای مالی، حقوقی یا فنی نیستند. خروجی‌ها برای برآورد اولیه
          هستند و باید با شرایط واقعی تطبیق داده شوند. مسئولیت استفاده از خروجی‌ها بر عهده کاربر
          است.
        </p>
      </section>

      <section className="section-surface p-6 md:p-8 space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">ارتباط با ما</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-7">
          اگر سؤال، پیشنهاد یا مشکلی دارید، از طریق کانال تلگرام یا صفحه پشتیبانی با ما در ارتباط
          باشید.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://t.me/persiantoolbox"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
          >
            کانال تلگرام
          </a>
          <Link href="/support" className="btn btn-secondary btn-sm">
            صفحه پشتیبانی
          </Link>
          <Link href="/privacy" className="btn btn-secondary btn-sm">
            سیاست حریم خصوصی
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
