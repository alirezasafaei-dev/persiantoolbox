import Script from 'next/script';
import dynamic from 'next/dynamic';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';

const RentVsBuyCalculator = dynamic(
  () => import('@/components/features/finance/RentVsBuyCalculator').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/tools/rent-vs-buy');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function RentVsBuyRoute() {
  return (
    <ToolPageShell tool={tool}>
      <Script
        id="rent-vs-buy-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه مقایسه اجاره و خرید مسکن',
            description: 'راهنمای گام به گام مقایسه هزینه اجاره و خرید خانه برای تصمیم‌گیری بهتر',
            step: [
              {
                '@type': 'HowToStep',
                name: 'اطلاعات ملک را وارد کنید',
                text: 'قیمت خرید ملک، اجاره ماهانه و ودیعه را وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'شرایط مالی را مشخص کنید',
                text: 'نرخ سود وام مسکن، نرخ سود سپرده و نرخ تورم را تعیین کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'مدت زمان مقایسه را انتخاب کنید',
                text: 'تعداد سال‌های مورد نظر برای مقایسه را مشخص کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'نتیجه مقایسه را مشاهده کنید',
                text: 'کل هزینه هر گزینه و بهترین انتخاب مالی را ببینید',
              },
            ],
          }),
        }}
      />
      <RentVsBuyCalculator />
    </ToolPageShell>
  );
}
