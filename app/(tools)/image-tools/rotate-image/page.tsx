import RotateImagePage from '@/components/features/image-tools/RotateImage';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'چرخش تصویر - جعبه ابزار فارسی',
  description: 'چرخش تصویر با هر زاویه‌ای در مرورگر. پردازش کاملاً محلی بدون ارسال داده.',
  path: '/image-tools/rotate-image',
  keywords: ['چرخش تصویر', 'rotate image', 'چرخش عکس', 'تغییر زاویه تصویر'],
});

export default function RotateImageRoute() {
  return <RotateImagePage />;
}
