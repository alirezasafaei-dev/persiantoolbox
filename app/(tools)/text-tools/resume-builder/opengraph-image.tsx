import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'رزومه\u200cساز آنلاین';
const path = '/text-tools/resume-builder';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
