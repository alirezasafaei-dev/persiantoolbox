import dynamic from 'next/dynamic';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';
import FinancialTransparencyBox from '@/components/finance/FinancialTransparencyBox';

const OvertimeCalculator = dynamic(() =>
  import('@/components/features/finance/OvertimeCalculator').then((m) => m.default),
);

const tool = getToolByPathOrThrow('/tools/overtime-calculator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function OvertimeCalculatorRoute() {
  return (
    <ToolPageShell tool={tool}>
      <OvertimeCalculator />
      <FinancialTransparencyBox
        calculationName="محاسبه‌گر اضافه کاری"
        formulaSummary="۴۰٪ اضافه بر حقوق پایه"
        dataSource="قانون کار جمهوری اسلامی ایران"
      />
    </ToolPageShell>
  );
}
