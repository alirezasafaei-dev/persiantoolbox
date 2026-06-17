import ResizeImagePage from '@/components/features/image-tools/ResizeImage';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'تغییر اندازه تصویر - جعبه ابزار فارسی',
  description: 'تغییر اندازه تصویر به پیکسل دلخواه در مرورگر. پردازش کاملاً محلی.',
  path: '/image-tools/resize-image',
  keywords: ['تغییر اندازه تصویر', 'resize image', 'تغییر سایز عکس', 'کوچک کردن عکس'],
});

export default function ResizeImageRoute() {
  return <ResizeImagePage />;
}
