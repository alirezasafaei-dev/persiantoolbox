import ImageFormatConverterPage from '@/components/features/image-tools/image-format-converter';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';

const tool = getToolByPathOrThrow('/image-tools/image-format-converter');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function ImageFormatConverterRoute() {
  return (
    <div className="space-y-10">
      <ImageFormatConverterPage />
      <div className="mt-8">
        <PortfolioCTA variant="tool-result" toolId="image-tools-image-format-converter" />
      </div>

      <ToolSeoContent tool={tool} />
    </div>
  );
}
