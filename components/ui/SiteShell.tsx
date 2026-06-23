import type { ReactNode } from 'react';
import Container from '@/components/ui/Container';
import Navigation from '@/components/ui/Navigation';
import Footer from '@/components/ui/Footer';
import FeedbackSurvey from '@/components/home/FeedbackSurvey';
import { cx } from '@/shared/ui/cx';

type Props = {
  children: ReactNode;
  withContainer?: boolean;
  containerClassName?: string;
  contentClassName?: string;
  topSlot?: ReactNode;
  withFooter?: boolean;
};

export default function SiteShell({
  children,
  withContainer = true,
  containerClassName = 'py-10',
  contentClassName,
  topSlot,
  withFooter = true,
}: Props) {
  return (
    <div className="min-h-dvh flex flex-col page-shell">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-[var(--radius-md)] focus:bg-[var(--color-primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-[var(--text-inverted)] focus:shadow-lg"
      >
        رفتن به محتوای اصلی
      </a>
      <Navigation />
      <main id="main-content" className={cx('flex-1', contentClassName)}>
        {withContainer ? (
          <Container className={containerClassName}>
            {topSlot ? <div className="mb-8">{topSlot}</div> : null}
            {children}
          </Container>
        ) : (
          <>
            {topSlot}
            {children}
          </>
        )}
      </main>
      {withFooter ? <Footer /> : null}
      <FeedbackSurvey />
    </div>
  );
}
