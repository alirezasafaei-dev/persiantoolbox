import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'محاسبه مهریه به نرخ روز';
const path = '/tools/mahr-calculator';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
