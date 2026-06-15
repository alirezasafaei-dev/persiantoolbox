import type { ReactNode } from 'react';
import ToolsRouteShell from '@/components/ui/ToolsRouteShell';
import { buildToolRouteLabelMap } from '@/lib/route-labels';

export default function ToolsLayout({ children }: { children: ReactNode }) {
  return <ToolsRouteShell routeLabels={buildToolRouteLabelMap()}>{children}</ToolsRouteShell>;
}
