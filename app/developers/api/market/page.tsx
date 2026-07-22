import Link from 'next/link';
import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';
import { getDeveloperApiProductOrThrow } from '@/lib/get-developer-api-product';

const product = getDeveloperApiProductOrThrow('market');

export const metadata = buildMetadata({
  title: 'API رایگان نرخ ارز، طلا و رمزارز | مستندات PersianToolbox',
  description:
    'مستندات API رایگان نرخ‌های مرجع ارز، طلا و رمزارز با نمونه cURL، JavaScript و Python، وضعیت freshness و محدودیت مصرف.',
  path: product.docsPath,
  keywords: product.keywords,
});

const responseExample = `{
  "ok": true,
  "data": {
    "timestamp": 1784726400000,
    "currencies": {
      "USD": { "code": "USD", "name": "دلار آمریکا", "rate": 1, "change24h": 0 },
      "EUR": { "code": "EUR", "name": "یورو", "rate": 0.92, "change24h": 0 }
    },
    "gold": { "pricePerGram": 0, "change24h": 0 },
    "crypto": {
      "BTC": { "symbol": "BTC", "name": "بیت‌کوین", "priceUSD": 0, "change24h": 0 }
    },
    "sources": ["exchangerate-api", "coingecko"],
    "freshness": "live"
  }
}`;

export default function MarketApiDocsPage() {
  return (
    <SiteShell containerClassName="py-10">
      <article className="space-y-10">
        <header className="section-surface space-y-4 p-6 md:p-8">
          <div className="text-xs font-semibold text-[var(--color-primary)]">GET {product.endpoint}</div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] md:text-4xl">{product.title}</h1>
          <p className="max-w-3xl leading-8 text-[var(--text-secondary)]">{product.description}</p>
          <div className="flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1">بدون API Key</span>
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1">{product.rateLimit}</span>
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1">JSON</span>
          </div>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">درخواست سریع</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              { title: 'cURL', code: 'curl https://persiantoolbox.ir/api/market' },
              {
                title: 'JavaScript',
                code: `const response = await fetch('https://persiantoolbox.ir/api/market');\nconst market = await response.json();`,
              },
              {
                title: 'Python',
                code: `import requests\nmarket = requests.get('https://persiantoolbox.ir/api/market', timeout=10).json()`,
              },
            ].map((sample) => (
              <div
                key={sample.title}
                className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5"
              >
                <h3 className="mb-3 font-bold text-[var(--text-primary)]">{sample.title}</h3>
                <pre
                  dir="ltr"
                  className="overflow-x-auto whitespace-pre-wrap rounded-[var(--radius-md)] bg-[var(--surface-2)] p-3 text-xs leading-6 text-[var(--text-secondary)]"
                >
                  {sample.code}
                </pre>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">ساختار پاسخ</h2>
          <pre
            dir="ltr"
            className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-2)] p-5 text-xs leading-6 text-[var(--text-secondary)]"
          >
            {responseExample}
          </pre>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6">
            <h2 className="mb-3 text-xl font-black text-[var(--text-primary)]">تازگی و کش</h2>
            <p className="leading-7 text-[var(--text-secondary)]">{product.cachePolicy}</p>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              پیش از ذخیره یا نمایش داده، مقدار <code dir="ltr">freshness</code> و آرایه{' '}
              <code dir="ltr">sources</code> را بررسی کنید.
            </p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6">
            <h2 className="mb-3 text-xl font-black text-[var(--text-primary)]">دامنه داده</h2>
            <p className="leading-7 text-[var(--text-secondary)]">
              نرخ‌ها مرجع فنی منابع متصل هستند و تضمین نرخ بازار آزاد ایران، نرخ معامله صرافی یا قیمت
              قابل خریدوفروش نیستند. برای تصمیم مالی، منبع و زمان پاسخ را کنترل کنید.
            </p>
          </div>
        </section>

        <section className="flex flex-wrap gap-3">
          <a
            href={product.endpoint}
            className="rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-bold text-[var(--text-inverted)]"
          >
            مشاهده پاسخ زنده
          </a>
          <a
            href="/openapi.json"
            className="rounded-full border border-[var(--border-light)] px-5 py-3 text-sm font-bold text-[var(--text-primary)]"
          >
            دریافت OpenAPI
          </a>
          <Link
            href="/developers/api/salary-laws"
            className="rounded-full border border-[var(--border-light)] px-5 py-3 text-sm font-bold text-[var(--text-primary)]"
          >
            API حقوق ۱۴۰۵
          </Link>
        </section>
      </article>
    </SiteShell>
  );
}
