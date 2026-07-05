import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ClientPage from './ClientPage';

const tool = getToolByPathOrThrow('/seo-tools/broken-link-checker');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function SeoToolRoute() {
  return <ClientPage />;
}
