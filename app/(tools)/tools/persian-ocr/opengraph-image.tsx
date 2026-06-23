import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'OCR فارسی';
const path = '/tools/persian-ocr';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
