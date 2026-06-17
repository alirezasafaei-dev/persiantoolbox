import { buildMetadata } from '@/lib/seo';
import ApiDocsContent from './ApiDocsContent';

export const metadata = buildMetadata({
  title: 'مستندات API - جعبه ابزار فارسی',
  description: 'مستندات API جعبه ابزار فارسی. اندپوینت‌های موجود و نحوه استفاده.',
  path: '/developers/api',
});

export default function ApiDocsPage() {
  return <ApiDocsContent />;
}
