import type { ReactNode } from 'react';
import Navigation from '@/components/ui/Navigation';
import Footer from '@/components/ui/Footer';
import Container from '@/components/ui/Container';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default function ToolsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col page-shell">
      <Navigation />
      <main className="flex-1">
        <Container className="py-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Breadcrumbs />
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--color-success-rgb)/0.3)] bg-[rgb(var(--color-success-rgb)/0.12)] px-3 py-1 text-xs font-semibold text-[var(--color-success)]">
              <span aria-hidden="true">🛡️</span>
              حالت آفلاین | امن
            </div>
          </div>
          {children}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
