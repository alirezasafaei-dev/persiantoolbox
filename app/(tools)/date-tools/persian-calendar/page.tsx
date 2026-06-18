import PersianCalendarPage from '@/components/features/date-tools/PersianCalendar';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';

const tool = getToolByPathOrThrow('/date-tools/persian-calendar');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function PersianCalendarRoute() {
  return (
    <div className="space-y-10">
      <PersianCalendarPage />
      <div className="mt-8">
        <PortfolioCTA variant="tool-result" toolId="date-tools-persian-calendar" />
      </div>

      <ToolSeoContent tool={tool} />
    </div>
  );
}
