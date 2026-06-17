import PersianCalendarPage from '@/components/features/date-tools/PersianCalendar';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

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
      <ToolSeoContent tool={tool} />
    </div>
  );
}
