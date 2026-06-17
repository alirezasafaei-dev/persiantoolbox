import TextToolsPage from '@/components/features/text-tools/TextToolsPage';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import CategoryGuideSection from '@/components/ui/CategoryGuideSection';
import { buildMetadata } from '@/lib/seo';
import { getCategoryContent, getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/text-tools');
const categoryContent = getCategoryContent('text-tools');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: categoryContent?.keywords ?? tool.keywords,
  path: tool.path,
});

export default function TextToolsRoute() {
  return (
    <div className="space-y-10">
      <TextToolsPage />
      {categoryContent && (
        <CategoryGuideSection categoryContent={categoryContent} guideTitle="راهنمای موضوعی متن" />
      )}
      <ToolSeoContent tool={tool} />
    </div>
  );
}
