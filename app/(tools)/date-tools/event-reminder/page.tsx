import EventReminderPage from '@/components/features/date-tools/EventReminder';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'یادآوری رویدادها - جعبه ابزار فارسی',
  description: 'ثبت و مدیریت رویدادهای مهم با یادآوری. ذخیره در مرورگر بدون نیاز به ثبت‌نام.',
  path: '/date-tools/event-reminder',
  keywords: ['یادآوری رویداد', 'تقویم یادآوری', 'event reminder', 'ثبت رویداد'],
});

export default function EventReminderRoute() {
  return <EventReminderPage />;
}
