import type { ReactNode } from 'react';
import ToolsRouteShell from '@/components/ui/ToolsRouteShell';

export default function ToolsLayout({ children }: { children: ReactNode }) {
  return <ToolsRouteShell>{children}</ToolsRouteShell>;
}
