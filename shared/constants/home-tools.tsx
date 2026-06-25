import type { ReactNode } from 'react';
import { IconCalculator, IconImage, IconMoney, IconPdf } from '@/shared/ui/icons';
import { getIndexableTools } from '@/lib/tools-registry';

export type HomeToolEntry = {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: ReactNode;
  iconWrapClassName: string;
};

const FALLBACK_ICON: { icon: ReactNode; wrap: string } = {
  icon: <IconCalculator className="h-7 w-7 text-[var(--color-primary)]" />,
  wrap: 'bg-[rgb(var(--color-primary-rgb)/0.12)]',
};

const categoryIconMap: Record<string, { icon: ReactNode; wrap: string }> = {
  'pdf-tools': {
    icon: <IconPdf className="h-7 w-7 text-[var(--color-danger)]" />,
    wrap: 'bg-[rgb(var(--color-danger-rgb)/0.12)]',
  },
  'image-tools': {
    icon: <IconImage className="h-7 w-7 text-[var(--color-info)]" />,
    wrap: 'bg-[rgb(var(--color-info-rgb)/0.12)]',
  },
  'finance-tools': {
    icon: <IconMoney className="h-7 w-7 text-[var(--color-success)]" />,
    wrap: 'bg-[rgb(var(--color-success-rgb)/0.12)]',
  },
};

function getIconForCategory(categoryId?: string): { icon: ReactNode; wrap: string } {
  if (categoryId) {
    const entry = categoryIconMap[categoryId];
    if (entry) {
      return entry;
    }
  }
  return FALLBACK_ICON;
}

export function getHomeTools(): HomeToolEntry[] {
  const tools = getIndexableTools()
    .filter((t) => t.kind === 'tool')
    .slice(0, 6);

  return tools.map((t) => {
    const { icon, wrap } = getIconForCategory(t.category?.id);
    const slug = t.path.split('/').pop() ?? t.id;
    const name = t.title.includes(' - ') ? t.title.split(' - ')[0]! : t.title;
    return {
      id: slug,
      title: name,
      description: t.description,
      path: t.path,
      icon,
      iconWrapClassName: wrap,
    };
  });
}

export const homeToolIndex: HomeToolEntry[] = getHomeTools();
