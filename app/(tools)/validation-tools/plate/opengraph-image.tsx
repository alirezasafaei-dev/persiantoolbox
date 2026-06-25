import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'اعتبارسنجی پلاک خودرو';
const path = '/validation-tools/plate';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
