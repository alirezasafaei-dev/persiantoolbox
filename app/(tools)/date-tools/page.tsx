import DateToolsPage from '@/components/features/date-tools/DateToolsPage';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import CategoryGuideSection from '@/components/ui/CategoryGuideSection';
import { buildMetadata } from '@/lib/seo';
import { getCategoryContent, getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/date-tools');
const categoryContent = getCategoryContent('date-tools');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: categoryContent?.keywords ?? tool.keywords,
  path: tool.path,
});

export default function DateToolsRoute() {
  return (
    <div className="space-y-10">
      <DateToolsPage />
      {categoryContent && (
        <CategoryGuideSection categoryContent={categoryContent} guideTitle="راهنمای موضوعی تاریخ" />
      )}
      <ToolSeoContent tool={tool} />
    </div>
  );
}
