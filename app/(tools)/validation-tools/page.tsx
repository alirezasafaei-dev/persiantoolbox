import ValidationToolsPageComponent from '@/components/features/validation-tools/ValidationToolsPage';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import CategoryGuideSection from '@/components/ui/CategoryGuideSection';
import { buildMetadata } from '@/lib/seo';
import { getCategoryContent, getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/validation-tools');
const categoryContent = getCategoryContent('validation-tools');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: categoryContent?.keywords ?? tool.keywords,
  path: tool.path,
});

export default function ValidationToolsRoute() {
  return (
    <div className="space-y-10">
      <ValidationToolsPageComponent />
      {categoryContent && (
        <CategoryGuideSection
          categoryContent={categoryContent}
          guideTitle="راهنمای موضوعی اعتبارسنجی"
        />
      )}
      <ToolSeoContent tool={tool} />
    </div>
  );
}
