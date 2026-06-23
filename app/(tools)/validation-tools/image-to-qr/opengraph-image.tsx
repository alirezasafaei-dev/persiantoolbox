import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'تصویر به QR Code';
const path = '/validation-tools/image-to-qr';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
