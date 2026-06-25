import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'ساخت فاکتور آنلاین';
const path = '/tools/invoice-generator';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
