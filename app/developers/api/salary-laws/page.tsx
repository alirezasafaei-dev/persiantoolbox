import Link from 'next/link';
import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';
import { developerApiProducts } from '@/lib/developer-api-catalog';

const product = developerApiProducts.find((item) => item.id === 'salary-laws');

if (!product) {
  throw new Error('Salary laws API catalog entry is missing');
}

export const metadata = buildMetadata({
  title: 'API حقوق و دستمزد ۱۴۰۵ | مالیات، بیمه و مزایا',
  description:
    'مستندات API نسخه‌دار حقوق و دستمزد ۱۴۰۵ شامل معافیت مالیاتی، نرخ بیمه، مزایا و پله‌های مالیاتی با ETag و نمونه کد.',
  path: product.docsPath,
  keywords: product.keywords,
});

const responseExample = `{
  "version": "v1",
  "updatedAt": "2026-04-26",
  "source": "local-versioned-json",
  "region": "default",
  "years": {
    "2026": {
      "year": 2026,
      "minimumWage": 15066904,
      "taxExemption": 40000000,
      "insuranceRate": 0.07,
      "housingAllowance": 3000000,
      "foodAllowance": 2200000,
      "taxBrackets": [
        { "upTo": 40000000, "rate": 0 },
        { "upTo": null, "rate": 0.3 }
      ]
    }
  }
}`;

export default function SalaryLawsApiDocsPage() {
  return (
    <SiteShell containerClassName="py-10">
      <article className="space-y-10">
        <header className="section-surface space-y-4 p-6 md:p-8">
          <div className="text-xs font-semibold text-[var(--color-primary)]">GET {product.endpoint}</div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] md:text-4xl">{product.title}</h1>
          <p className="max-w-3xl leading-8 text-[var(--text-secondary)]">{product.description}</p>
          <div className="flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1">بدون API Key</span>
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1">ETag</span>
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1">Last-Modified</span>
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1">JSON نسخه‌دار</span>
          </div>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">نمونه استفاده</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              { title: 'cURL', code: 'curl -i https://persiantoolbox.ir/api/data/salary-laws' },
              {
                title: 'JavaScript',
                code: `const response = await fetch('https://persiantoolbox.ir/api/data/salary-laws');\nconst laws = await response.json();\nconst etag = response.headers.get('etag');`,
              },
              {
                title: 'Python',
                code: `import requests\nr = requests.get('https://persiantoolbox.ir/api/data/salary-laws', timeout=10)\nlaws = r.json()\netag = r.headers.get('ETag')`,
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
          <h2 className="text-2xl font-black text-[var(--text-primary)]">ساختار داده</h2>
          <pre
            dir="ltr"
            className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-2)] p-5 text-xs leading-6 text-[var(--text-secondary)]"
          >
            {responseExample}
          </pre>
          <p className="text-sm leading-7 text-[var(--text-muted)]">
            نمونه بالا برای نمایش قرارداد کوتاه شده است. پاسخ زنده می‌تواند مزایا و تمام پله‌های
            مالیاتی را شامل شود. واحد هر مقدار را قبل از استفاده در محاسبات مالی خود با نسخه dataset
            و مستندات ابزار حقوق تطبیق دهید.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6">
            <h2 className="mb-3 text-xl font-black text-[var(--text-primary)]">کش شرطی با ETag</h2>
            <p className="leading-7 text-[var(--text-secondary)]">{product.cachePolicy}</p>
            <pre
              dir="ltr"
              className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-[var(--radius-md)] bg-[var(--surface-2)] p-3 text-xs leading-6 text-[var(--text-secondary)]"
            >
              {`curl -H 'If-None-Match: "salary-laws-v1-..."' \\\n  https://persiantoolbox.ir/api/data/salary-laws`}
            </pre>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6">
            <h2 className="mb-3 text-xl font-black text-[var(--text-primary)]">کنترل صحت</h2>
            <p className="leading-7 text-[var(--text-secondary)]">
              این endpoint یک dataset نرم‌افزاری نسخه‌دار است، نه متن رسمی قانون. برای محاسبات حقوقی،
              حسابداری یا پرداخت واقعی، تاریخ <code dir="ltr">updatedAt</code>، نسخه، واحد اعداد و
              منابع رسمی همان سال را کنترل کنید.
            </p>
          </div>
        </section>

        <section className="flex flex-wrap gap-3">
          <a
            href={product.endpoint}
            className="rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-bold text-[var(--text-inverted)]"
          >
            مشاهده dataset زنده
          </a>
          <Link
            href="/salary"
            className="rounded-full border border-[var(--border-light)] px-5 py-3 text-sm font-bold text-[var(--text-primary)]"
          >
            محاسبه‌گر حقوق
          </Link>
          <a
            href="/openapi.json"
            className="rounded-full border border-[var(--border-light)] px-5 py-3 text-sm font-bold text-[var(--text-primary)]"
          >
            دریافت OpenAPI
          </a>
          <Link
            href="/developers/api/market"
            className="rounded-full border border-[var(--border-light)] px-5 py-3 text-sm font-bold text-[var(--text-primary)]"
          >
            Market API
          </Link>
        </section>
      </article>
    </SiteShell>
  );
}
