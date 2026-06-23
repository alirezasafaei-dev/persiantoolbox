import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'تقویم شمسی';
const path = '/date-tools/persian-calendar';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
