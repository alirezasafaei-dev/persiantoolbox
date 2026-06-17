import TextOnImagePage from '@/components/features/image-tools/TextOnImage';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'افزودن متن به تصویر - جعبه ابزار فارسی',
  description: 'افزودن متن با رنگ و اندازه دلخواه روی تصویر. پردازش کاملاً محلی در مرورگر.',
  path: '/image-tools/text-on-image',
  keywords: ['متن روی تصویر', 'text on image', 'نوشتن روی عکس', 'افزودن متن'],
});

export default function TextOnImageRoute() {
  return <TextOnImagePage />;
}
