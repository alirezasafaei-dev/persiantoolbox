import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { rentalLeaseTemplate } from '@/lib/contract-tools/templates';
import ContractWizard from '@/components/features/contract-tools/ContractWizard';

export const metadata = buildMetadata({
  title: `${rentalLeaseTemplate.title} — نمونه قرارداد اجاره آنلاین`,
  description:
    'پیش‌نویس قرارداد اجاره مسکونی با اطلاعات کامل طرفین، ملک، مبلغ و شرایط. قابل ویرایش.',
  path: '/contract-tools/rental-lease',
  keywords: [
    'قرارداد اجاره',
    'نمونه قرارداد اجاره مسکونی',
    'پیش‌نویس اجاره',
    'قرارداد مستأجر و موجر',
  ],
});

export default function RentalLeasePage() {
  return (
    <SiteShell containerClassName="py-10">
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای قرارداد', url: `${siteUrl}/contract-tools` },
          { name: 'قرارداد اجاره مسکونی', url: `${siteUrl}/contract-tools/rental-lease` },
        ]}
      />
      <div className="max-w-3xl mx-auto">
        <ContractWizard initialTemplateId="rental-lease" />
      </div>
    </SiteShell>
  );
}
