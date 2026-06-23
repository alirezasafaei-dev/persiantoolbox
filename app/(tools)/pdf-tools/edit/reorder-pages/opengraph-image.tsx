import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'جابجایی صفحات PDF';
const path = '/pdf-tools/edit/reorder-pages';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
