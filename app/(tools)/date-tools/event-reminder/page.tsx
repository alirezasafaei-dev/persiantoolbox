import EventReminderPage from '@/components/features/date-tools/EventReminder';
import ToolPageShell from '@/components/ui/ToolPageShell';
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
    <ToolPageShell tool={tool}>
      <EventReminderPage />
    </ToolPageShell>
  );
}
