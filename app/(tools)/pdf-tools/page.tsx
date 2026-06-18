import PdfToolsPage from '@/components/features/pdf-tools/PdfToolsPage';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import CategoryGuideSection from '@/components/ui/CategoryGuideSection';
import { buildMetadata } from '@/lib/seo';
import { getCategoryContent, getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/pdf-tools');
const categoryContent = getCategoryContent('pdf-tools');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: categoryContent?.keywords ?? tool.keywords,
  path: tool.path,
});

export default function PdfToolsRoute() {
  return (
    <div className="space-y-10">
      <PdfToolsPage />
      {categoryContent && (
        <CategoryGuideSection categoryContent={categoryContent} guideTitle="راهنمای موضوعی PDF" />
      )}
      <ToolSeoContent tool={tool} />
    </div>
  );
}
