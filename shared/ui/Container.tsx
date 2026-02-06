import type { ReactNode } from 'react';
import { cx } from './cx';

type Props = {
  children: ReactNode;
  className?: string;
};

export default function Container(props: Props) {
  return (
    <div
      className={cx(
        'mx-auto w-full max-w-[var(--container-max)] px-4 md:px-6 lg:px-8',
        props.className,
      )}
    >
      {props.children}
    </div>
  );
}
