import ImageToQRPage from '@/components/features/validation-tools/ImageToQR';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'تولید QR Code - جعبه ابزار فارسی',
  description: 'تولید QR Code از متن، URL یا تصویر. دانلود رایگان با کیفیت بالا.',
  path: '/validation-tools/image-to-qr',
  keywords: ['تولید QR Code', 'QR Code', 'کد QR', 'تبدیل به QR'],
});

export default function ImageToQRRoute() {
  return <ImageToQRPage />;
}
