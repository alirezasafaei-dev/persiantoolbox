import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'یادآور رویداد';
const path = '/date-tools/event-reminder';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
