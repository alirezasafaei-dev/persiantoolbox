import ImageWorkspace from '@/components/ai/ImageWorkspace';
import SiteShell from '@/components/ui/SiteShell';
import { imageGenerationReady } from '@/lib/ai/image-quota';
import { buildMetadata } from '@/lib/seo';

// The image page is intentionally not indexable until explicitly approved for release.
export const dynamic = 'force-dynamic';
export const metadata = buildMetadata({
  title: 'ساخت تصویر با هوش مصنوعی | جعبه ابزار فارسی',
  description: 'محیط آزمایشی ساخت تصویر با توضیح فارسی، رضایت صریح و سهمیه محدود.',
  path: '/ai/image',
  robots: { index: false, follow: false },
});

export default function AiImagePage() {
  return (
    <SiteShell containerClassName="py-0">
      <ImageWorkspace enabled={imageGenerationReady()} />
    </SiteShell>
  );
}
