import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { constructionContractorTemplate } from '@/lib/contract-tools/templates';
import ContractWizard from '@/components/features/contract-tools/ContractWizard';

export const metadata = buildMetadata({
  title: `${constructionContractorTemplate.title} — نمونه قرارداد پیمانکاری آنلاین`,
  description: 'پیش‌نویس قرارداد پیمانکاری و معماری ساختمان با بندهای تخصصی. قابل ویرایش.',
  path: '/contract-tools/construction-contractor',
  keywords: ['قرارداد پیمانکاری', 'قرارداد معماری', 'نمونه قرارداد ساختمان', 'پیش‌نویس پیمانکاری'],
});

export default function ConstructionContractorPage() {
  return (
    <SiteShell containerClassName="py-10">
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای قرارداد', url: `${siteUrl}/contract-tools` },
          { name: 'قرارداد پیمانکاری', url: `${siteUrl}/contract-tools/construction-contractor` },
        ]}
      />
      <div className="max-w-3xl mx-auto">
        <ContractWizard initialTemplateId="construction-contractor" />
      </div>
    </SiteShell>
  );
}
