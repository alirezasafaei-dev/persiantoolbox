import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import ResumeBuilder from '@/components/features/text-tools/ResumeBuilder';

export const metadata: Metadata = buildMetadata({
  title: 'ساخت رزومه آنلاین رایگان - جعبه ابزار فارسی',
  description:
    'رزومه حرفه‌ای خود را به صورت آنلاین و رایگان بسازید. خروجی PDF با طراحی زیبا و RTL.',
  path: '/text-tools/resume-builder',
  keywords: [
    'ساخت رزومه',
    'رزومه آنلاین',
    'رزومه فارسی',
    'رزومه رایگان',
    'ساخت CV',
    'رزومه PDF',
  ],
});

export default function ResumeBuilderPage() {
  return <ResumeBuilder />;
}
