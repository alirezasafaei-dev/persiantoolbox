'use client';

import type { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';

type Props = {
  children: ReactNode;
};

export default function MotionProvider({ children }: Props) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
