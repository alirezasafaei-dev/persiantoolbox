import PersianCalendarPage from '@/components/features/date-tools/PersianCalendar';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'تقویم فارسی - جعبه ابزار فارسی',
  description: 'تقویم فارسی (هجری خورشیدی) با نمایش ماه‌ها و روزها. امروز و ماه جاری.',
  path: '/date-tools/persian-calendar',
  keywords: ['تقویم فارسی', 'تقویم شمسی', 'persian calendar', 'تقویم ۱۴۰۵'],
});

export default function PersianCalendarRoute() {
  return <PersianCalendarPage />;
}
