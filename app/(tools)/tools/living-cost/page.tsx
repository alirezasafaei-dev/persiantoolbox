import Script from 'next/script';
import dynamic from 'next/dynamic';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const LivingCostPage = dynamic(
  () => import('@/components/features/finance/LivingCost').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/tools/living-cost');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function LivingCostRoute() {
  return (
    <ToolPageShell tool={tool}>
      <Script
        id="living-cost-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه محاسبه هزینه زندگی',
            description: 'راهنمای گام به گام محاسبه هزینه‌های ماهانه زندگی و بودجه‌بندی',
            step: [
              {
                '@type': 'HowToStep',
                name: 'هزینه‌های ثابت را وارد کنید',
                text: 'اجاره، قبوض، بیمه و اقساط ماهانه را وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'هزینه‌های متغیر را وارد کنید',
                text: 'هزینه خوراک، حمل‌ونقل، پوشاک و تفریح ماهانه را اضافه کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'درآمد ماهانه را وارد کنید',
                text: 'مبلغ درآمد خالص ماهانه پس از کسر بیمه و مالیات را وارد نمایید',
              },
              {
                '@type': 'HowToStep',
                name: 'تحلیل بودجه را مشاهده کنید',
                text: 'تراز درآمد و هزینه، درصد پس‌انداز و پیشنهادات صرفه‌جویی را ببینید',
              },
            ],
          }),
        }}
      />
      <LivingCostPage />
    </ToolPageShell>
  );
}
