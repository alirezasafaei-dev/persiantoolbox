import Script from 'next/script';
import { buildMetadata, siteUrl } from '@/lib/seo';
import MarketDashboard from '@/components/features/market/MarketDashboard';
import SiteShell from '@/components/ui/SiteShell';

export const metadata = buildMetadata({
  title: 'داشبورد بازار - جعبه ابزار فارسی',
  description:
    'نمای زنده از نرخ ارزها، طلا، سکه و ارزهای دیجیتال. اطلاعات بازار برای تصمیم‌گیری مالی.',
  path: '/market',
  keywords: ['نرخ ارز', 'قیمت طلا', 'بازار مالی', 'ارز دیجیتال', 'نرخ دلار'],
});

export default function MarketPage() {
  return (
    <SiteShell containerClassName="py-10">
      <Script
        id="market-item-list"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'بازار - قیمت لحظه‌ای طلا و ارز',
            description: 'مشاهده قیمت لحظه‌ای طلا، سکه، ارز و ارزهای دیجیتال',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'نرخ ارز',
                url: `${siteUrl}/market/currency-rates`,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'قیمت طلا و سکه',
                url: `${siteUrl}/market/gold-prices`,
              },
            ],
          }),
        }}
      />
      <MarketDashboard />
    </SiteShell>
  );
}
