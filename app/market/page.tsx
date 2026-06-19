import { buildMetadata } from '@/lib/seo';
import MarketDashboard from '@/components/features/market/MarketDashboard';

export const metadata = buildMetadata({
  title: 'داشبورد بازار - جعبه ابزار فارسی',
  description: 'نمای زنده از نرخ ارزها، طلا، سکه و ارزهای دیجیتال. اطلاعات بازار برای تصمیم‌گیری مالی.',
  path: '/market',
  keywords: ['نرخ ارز', 'قیمت طلا', 'بازار مالی', 'ارز دیجیتال', 'نرخ دلار'],
});

export default function MarketPage() {
  return <MarketDashboard />;
}
