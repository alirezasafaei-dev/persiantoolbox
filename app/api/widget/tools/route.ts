import { toolsRegistry } from '@/lib/tools-registry';

export const runtime = 'edge';
export const dynamic = 'force-static';

export async function GET() {
  const items = toolsRegistry
    .filter((t) => t.kind === 'tool' && t.indexable !== false)
    .map((t) => ({
      id: t.id,
      title: t.title,
      path: t.path,
      category: t.category?.name ?? '',
      catId: t.category?.id ?? '',
    }));

  const cats = [
    ...new Map(
      toolsRegistry
        .filter((t) => t.kind === 'category' || t.kind === 'hub')
        .map((t) => [
          t.category?.id ?? t.id,
          {
            id: t.category?.id ?? t.id,
            name: t.category?.name ?? t.title,
            path: t.path,
          },
        ]),
    ).values(),
  ];

  return Response.json({ items, cats, version: 1 });
}
