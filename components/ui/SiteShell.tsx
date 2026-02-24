import type { ReactNode } from 'react';
import Container from '@/components/ui/Container';
import Navigation from '@/components/ui/Navigation';
import Footer from '@/components/ui/Footer';
import { cx } from '@/shared/ui/cx';

type Props = {
  children: ReactNode;
  withContainer?: boolean;
  containerClassName?: string;
  contentClassName?: string;
  topSlot?: ReactNode;
};

export default function SiteShell({
  children,
  withContainer = true,
  containerClassName = 'py-10',
  contentClassName,
  topSlot,
}: Props) {
  return (
    <div className="min-h-dvh flex flex-col page-shell">
      <Navigation />
      <div className={cx('flex-1', contentClassName)}>
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
      </div>
      <Footer />
    </div>
  );
}
