import { Card, ButtonLink } from '@/components/ui';
import { getFeatureHref } from '@/lib/features/availability';
import { IconShield, IconMoney, IconZap, IconHeart } from '@/shared/ui/icons';

const plans = [
  {
    title: 'پلن پایه ماهانه',
    price: '۹۹٬۰۰۰ تومان / ماه',
    tag: 'محبوب برای شروع',
    features: ['تاریخچه ۳۰ روزه', 'فضای ذخیره ۵۰۰ مگابایت', 'حذف تبلیغات', 'جستجو و فیلتر تاریخچه'],
    tone: 'bg-[rgb(var(--color-primary-rgb)/0.12)] text-[var(--color-primary)]',
    popular: false,
  },
  {
    title: 'پلن حرفه‌ای ماهانه',
    price: '۱۹۹٬۰۰۰ تومان / ماه',
    tag: 'برای کاربران پرتکرار',
    features: [
      'تاریخچه نامحدود',
      'فضای ذخیره ۵ گیگابایت',
      'حذف تبلیغات',
      'دسترسی زودهنگام به قابلیت‌های جدید',
      'اولویت پشتیبانی',
    ],
    tone: 'bg-[rgb(var(--color-success-rgb)/0.12)] text-[var(--color-success)]',
    popular: true,
  },
  {
    title: 'پلن پایه سالانه',
    price: '۸۹۰٬۰۰۰ تومان / سال',
    tag: 'صرفه‌جویی ۲۵٪',
    features: ['تاریخچه ۳۰ روزه', 'فضای ذخیره ۵۰۰ مگابایت', 'حذف تبلیغات', 'جستجو و فیلتر تاریخچه'],
    tone: 'bg-[rgb(var(--color-primary-rgb)/0.12)] text-[var(--color-primary)]',
    popular: false,
  },
  {
    title: 'پلن حرفه‌ای سالانه',
    price: '۱٬۷۹۰٬۰۰۰ تومان / سال',
    tag: 'صرفه‌جویی ۲۵٪',
    features: [
      'تاریخچه نامحدود',
      'فضای ذخیره ۵ گیگابایت',
      'حذف تبلیغات',
      'دسترسی زودهنگام به قابلیت‌های جدید',
      'اولویت پشتیبانی',
    ],
    tone: 'bg-[rgb(var(--color-success-rgb)/0.12)] text-[var(--color-success)]',
    popular: false,
  },
];

const comparisonFeatures = [
  { feature: 'تاریخچه کارها', basic: '۳۰ روز', pro: 'نامحدود' },
  { feature: 'فضای ذخیره‌سازی', basic: '۵۰۰ مگابایت', pro: '۵ گیگابایت' },
  { feature: 'حذف تبلیغات', basic: true, pro: true },
  { feature: 'جستجو و فیلتر', basic: true, pro: true },
  { feature: 'ذخیره سناریوها', basic: false, pro: true },
  { feature: 'گزارش PDF', basic: false, pro: true },
  { feature: 'فاکتور آنلاین', basic: false, pro: true },
  { feature: 'دسترسی زودهنگام', basic: false, pro: true },
  { feature: 'اولویت پشتیبانی', basic: false, pro: true },
];

const faqItems = [
  {
    question: 'آیا ابزارها رایگان هستند؟',
    answer:
      'بله، تمام ابزارهای پردازشی (تبدیل PDF، ماشین‌حساب‌ها، ویرایش متن و غیره) برای همه کاربران رایگان و بدون محدودیت هستند. اشتراک فقط برای امکانات ذخیره‌سازی و مدیریت است.',
  },
  {
    question: 'چه چیزی با اشتراک پرو دریافت می‌کنم؟',
    answer:
      'با اشتراک پرو به تاریخچه نامحدود، ذخیره سناریوهای مالی، تولید گزارش PDF حرفه‌ای، فاکتور آنلاین، حذف تبلیغات و اولویت پشتیبانی دسترسی خواهید داشت.',
  },
  {
    question: 'آیا امکان لغو اشتراک وجود دارد؟',
    answer:
      'بله، شما در هر زمان می‌توانید اشتراک خود را لغو کنید. تا پایان دوره پرداخت شده، دسترسی شما فعال خواهد ماند.',
  },
  {
    question: 'آیا اطلاعات من ایمن است؟',
    answer:
      'بله، تمام پردازش‌ها در مرورگر شما انجام می‌شود و فایل‌ها به سرور ارسال نمی‌شوند. اطلاعات ذخیره‌شده با رمزنگاری محافظت می‌شوند.',
  },
  {
    question: 'تفاوت پلن ماهانه و سالانه چیست؟',
    answer:
      'پلن سالانه ۲۵٪ صرفه‌جویی نسبت به پرداخت ماهانه دارد. امکانات هر دو پلن یکسان است و فقط مدت زمان اشتراک متفاوت است.',
  },
];

const highlights = [
  {
    title: 'ابزارها رایگان می‌مانند',
    description: 'پردازش محلی برای همه فعال است و هیچ ابزاری قفل نمی‌شود.',
    icon: IconShield,
    tone: 'bg-[rgb(var(--color-success-rgb)/0.12)] text-[var(--color-success)]',
  },
  {
    title: 'ارزش واقعی در ازای پرداخت',
    description: 'پرداخت فقط برای تاریخچه و آرشیو کارهاست.',
    icon: IconHeart,
    tone: 'bg-[rgb(var(--color-warning-rgb)/0.12)] text-[var(--color-warning)]',
  },
  {
    title: 'قیمت‌گذاری منعطف',
    description: 'پلن‌ها با توجه به نیازهای مختلف طراحی شده‌اند.',
    icon: IconMoney,
    tone: 'bg-[rgb(var(--color-primary-rgb)/0.12)] text-[var(--color-primary)]',
  },
  {
    title: 'رشد پایدار',
    description: 'درآمد اشتراک صرف توسعه ابزارهای جدید می‌شود.',
    icon: IconZap,
    tone: 'bg-[rgb(var(--color-info-rgb)/0.12)] text-[var(--color-info)]',
  },
];

export default function SubscriptionPlansPage() {
  const supportHref = getFeatureHref('support');
  const accountHref = getFeatureHref('account');
  const roadmapHref = getFeatureHref('subscription-roadmap');

  return (
    <div className="space-y-10">
      <section className="section-surface p-6 md:p-8">
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
            پلن‌های اشتراک تاریخچه
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)]">
            تاریخچه کارها را حرفه‌ای مدیریت کنید
          </h1>
          <p className="text-[var(--text-secondary)] leading-7">
            ابزارها برای همه رایگان هستند. با اشتراک تاریخچه، خروجی‌های قبلی را نگه دارید، از
            تبلیغات خلاص شوید و دسترسی سریع‌تری به کارهای خود داشته باشید.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={supportHref} size="sm">
              حمایت یا اشتراک
            </ButtonLink>
            <ButtonLink href={accountHref} size="sm" variant="secondary">
              شروع اشتراک
            </ButtonLink>
            <ButtonLink href={roadmapHref} size="sm" variant="secondary">
              نقشه‌راه عمومی اشتراک
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.title} className="p-6 space-y-4 relative">
            {plan.popular ? (
              <div className="absolute -top-3 right-4 rounded-full bg-[var(--color-success)] px-3 py-1 text-xs font-bold text-white shadow-md">
                ⭐ پرطرفدار
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-black text-[var(--text-primary)]">{plan.title}</div>
                <div className="text-sm text-[var(--text-muted)]">{plan.tag}</div>
              </div>
              <div className={`rounded-full px-3 py-1 text-xs font-semibold ${plan.tone}`}>
                {plan.price}
              </div>
            </div>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <ButtonLink
              href={accountHref}
              size="sm"
              variant={plan.popular ? 'primary' : 'secondary'}
              className="w-full justify-center"
            >
              انتخاب این پلن
            </ButtonLink>
          </Card>
        ))}
      </section>

      <section>
        <h2 className="text-2xl font-black text-[var(--text-primary)] mb-4">مقایسه امکانات</h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-light)]">
                  <th className="px-4 py-3 text-right font-bold text-[var(--text-primary)]">
                    امکان
                  </th>
                  <th className="px-4 py-3 text-center font-bold text-[var(--color-primary)]">
                    پلن پایه
                  </th>
                  <th className="px-4 py-3 text-center font-bold text-[var(--color-success)]">
                    پلن حرفه‌ای
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row) => {
                  let basicCell;
                  if (typeof row.basic === 'boolean') {
                    basicCell = row.basic ? (
                      <span className="text-[var(--color-success)]">✓</span>
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    );
                  } else {
                    basicCell = <span className="text-[var(--text-secondary)]">{row.basic}</span>;
                  }
                  let proCell;
                  if (typeof row.pro === 'boolean') {
                    proCell = row.pro ? (
                      <span className="text-[var(--color-success)]">✓</span>
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    );
                  } else {
                    proCell = <span className="text-[var(--text-secondary)]">{row.pro}</span>;
                  }
                  return (
                    <tr
                      key={row.feature}
                      className="border-b border-[var(--border-light)] last:border-0"
                    >
                      <td className="px-4 py-3 text-[var(--text-primary)]">{row.feature}</td>
                      <td className="px-4 py-3 text-center">{basicCell}</td>
                      <td className="px-4 py-3 text-center">{proCell}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {highlights.map((item) => (
          <Card key={item.title} className="p-5 md:p-6">
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${item.tone}`}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--text-primary)]">{item.title}</div>
                <div className="text-sm text-[var(--text-muted)] leading-6">{item.description}</div>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section>
        <h2 className="text-2xl font-black text-[var(--text-primary)] mb-4">سوالات متداول</h2>
        <div className="space-y-3">
          {faqItems.map((item) => (
            <details key={item.question} className="group">
              <summary className="flex items-center justify-between cursor-pointer rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-5 py-4 text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors list-none">
                {item.question}
                <span className="text-[var(--text-muted)] transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <div className="px-5 py-3 text-sm text-[var(--text-secondary)] leading-7 border border-t-0 border-[var(--border-light)] rounded-b-[var(--radius-md)] bg-[var(--surface-1)]">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      <Card className="p-6 space-y-3">
        <div className="text-lg font-black text-[var(--text-primary)]">پلن سازمانی</div>
        <p className="text-sm text-[var(--text-muted)] leading-7">
          برای سازمان‌ها و تیم‌هایی که حجم استفاده بالاتری دارند، پلن اختصاصی با شرایط و SLA قابل
          مذاکره است.
        </p>
      </Card>
    </div>
  );
}
