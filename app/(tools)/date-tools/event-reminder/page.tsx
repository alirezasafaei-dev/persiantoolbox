import EventReminderPage from '@/components/features/date-tools/EventReminder';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';

const tool = getToolByPathOrThrow('/date-tools/event-reminder');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function EventReminderRoute() {
  return (
    <div className="space-y-10">
      <EventReminderPage />
      <div className="mt-8">
        <PortfolioCTA variant="tool-result" toolId="date-tools-event-reminder" />
      </div>

      <ToolSeoContent tool={tool} />
    </div>
  );
}
