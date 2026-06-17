import EventReminderPage from '@/components/features/date-tools/EventReminder';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

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
      <ToolSeoContent tool={tool} />
    </div>
  );
}
