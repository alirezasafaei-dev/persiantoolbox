import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'محاسبه مرخصی';
const path = '/tools/leave-calculator';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
