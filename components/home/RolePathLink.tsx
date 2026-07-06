'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ANALYTICS_EVENTS, trackAnalyticsEvent } from '@/shared/analytics/events';

type RolePathLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  roleTrack: string;
  roleBadge: string;
  linkLabel: string;
  linkType: 'track' | 'tool';
  position: number;
};

export default function RolePathLink({
  href,
  className,
  children,
  roleTrack,
  roleBadge,
  linkLabel,
  linkType,
  position,
}: RolePathLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        trackAnalyticsEvent(ANALYTICS_EVENTS.ROLE_PATH_CLICK, {
          surface: 'homepage_role_paths',
          roleTrack,
          roleBadge,
          linkLabel,
          linkType,
          position,
          destination: href,
        });
      }}
    >
      {children}
    </Link>
  );
}
