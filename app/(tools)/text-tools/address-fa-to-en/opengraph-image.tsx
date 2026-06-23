import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'تبدیل آدرس فارسی به انگلیسی';
const path = '/text-tools/address-fa-to-en';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
