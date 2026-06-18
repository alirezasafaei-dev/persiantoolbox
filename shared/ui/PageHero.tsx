import type { ReactNode } from 'react';
import { cx } from './cx';

const gradientMap = {
  primary:
    'bg-[radial-gradient(circle_at_top,_rgb(var(--color-primary-rgb)/0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgb(var(--color-success-rgb)/0.12),_transparent_60%)]',
  info: 'bg-[radial-gradient(circle_at_top,_rgb(var(--color-info-rgb)/0.18),_transparent_55%)]',
  warning:
    'bg-[radial-gradient(circle_at_top,_rgb(var(--color-warning-rgb)/0.18),_transparent_55%)]',
  danger:
    'bg-[radial-gradient(circle_at_top,_rgb(var(--color-danger-rgb)/0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgb(var(--color-info-rgb)/0.12),_transparent_60%)]',
  success:
    'bg-[radial-gradient(circle_at_top,_rgb(var(--color-success-rgb)/0.18),_transparent_55%)]',
};

const badgeColorMap = {
  success: 'bg-[var(--color-success)]',
  info: 'bg-[var(--color-info)]',
  warning: 'bg-[var(--color-warning)]',
  primary: 'bg-[var(--color-primary)]',
  danger: 'bg-[var(--color-danger)]',
};

type PageHeroGradient = keyof typeof gradientMap;
type PageHeroBadgeColor = keyof typeof badgeColorMap;

type Badge = {
  text: string;
  color?: PageHeroBadgeColor;
};

type Props = {
  title: string;
  description: string;
  badges?: Badge[];
  children?: ReactNode;
  className?: string;
  gradient?: PageHeroGradient;
};

export default function PageHero({
  title,
  description,
  badges,
  children,
  className,
  gradient = 'primary',
}: Props) {
  return (
    <section className={cx('relative overflow-hidden section-surface p-6 md:p-10', className)}>
      <div className={cx('absolute inset-0 -z-10', gradientMap[gradient])} />
      <div className="relative space-y-4 text-center">
        {badges && badges.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 text-xs text-[var(--text-muted)]">
            {badges.map((badge) => (
              <span
                key={badge.text}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)]/70 px-3 py-1"
              >
                <span
                  className={cx('h-2 w-2 rounded-full', badgeColorMap[badge.color ?? 'info'])}
                />
                {badge.text}
              </span>
            ))}
          </div>
        )}
        <h1
          className="text-3xl font-black text-[var(--text-primary)] md:text-4xl"
          id={`${title.replace(/\s+/g, '-').toLowerCase()}-heading`}
        >
          {title}
        </h1>
        <p className="text-base text-[var(--text-muted)] md:text-lg">{description}</p>
        {children}
      </div>
    </section>
  );
}
