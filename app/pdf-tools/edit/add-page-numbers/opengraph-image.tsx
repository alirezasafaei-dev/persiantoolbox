import { createToolOgImage, ogImageContentType, ogImageSize } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'افزودن شماره صفحه به PDF';
const path = '/pdf-tools/edit/add-page-numbers';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
