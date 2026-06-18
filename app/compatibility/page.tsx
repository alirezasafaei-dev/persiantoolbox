import { buildMetadata } from '@/lib/seo';
import CompatibilityContent from './CompatibilityContent';

export const metadata = buildMetadata({
  title: 'سازگاری مرورگرها - جعبه ابزار فارسی',
  description: 'مرورگرهای پشتیبانی شده و سطح سازگاری جعبه ابزار فارسی را بررسی کنید.',
  path: '/compatibility',
});

export default function CompatibilityPage() {
  return <CompatibilityContent />;
}
