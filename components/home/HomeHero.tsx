import ButtonLink from '@/shared/ui/ButtonLink';
import { getHomeHeroCopy } from '@/lib/home-copy';
import { IconCheck, IconShield } from '@/shared/ui/icons';
import HeroQuickLinks from '@/components/home/HeroQuickLinks';
import dynamic from 'next/dynamic';

const LazyToolSearch = dynamic(() => import('@/components/home/ToolSearch'), {
  loading: () => (
    <div className="mx-auto h-14 max-w-2xl animate-pulse rounded-full bg-[var(--surface-1)]" />
  ),
});

type Props = {
  toolCount: number;
};

export default function HomeHero({ toolCount }: Props) {
  const hero = getHomeHeroCopy(toolCount);

  return (
    <section
      className="hero-section relative overflow-hidden p-8 md:p-12 lg:p-16"
      aria-labelledby="hero-heading"
    >
      <div className="pointer-events-none absolute -top-20 right-1/4 h-80 w-80 rounded-full bg-[rgb(var(--color-primary-rgb)/0.15)] blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-20 left-1/4 h-64 w-64 rounded-full bg-[rgb(var(--color-success-rgb)/0.12)] blur-[80px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgb(var(--color-warning-rgb)/0.08)] blur-[60px]" />

      <div className="relative space-y-6 text-center">
        <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-[rgb(var(--color-primary-rgb)/0.2)] bg-[rgb(var(--color-primary-rgb)/0.08)] px-4 py-1.5 text-xs font-semibold text-[var(--color-primary)]">
          <span
            className="h-2 w-2 rounded-full bg-[var(--color-success)] animate-pulse"
            aria-hidden="true"
          />
          {hero.eyebrow}
        </p>

        <div className="space-y-3">
          <h1
            id="hero-heading"
            className="text-4xl font-black leading-tight text-[var(--text-primary)] md:text-5xl lg:text-6xl"
          >
            {hero.title}
          </h1>
          <p className="text-xl font-bold leading-relaxed text-[var(--color-primary)] md:text-2xl">
            {hero.titleAccent}
          </p>
        </div>

        <p className="mx-auto max-w-2xl text-base leading-8 text-[var(--text-secondary)] md:text-lg">
          {hero.subtitle}
        </p>

        <div className="mx-auto max-w-2xl">
          <LazyToolSearch />
        </div>

        <HeroQuickLinks />

        <div className="flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/topics" size="lg" className="px-8">
            {hero.primaryCta} ←
          </ButtonLink>
          <ButtonLink href="/pricing" variant="secondary" size="lg" className="px-8">
            {hero.secondaryCtaLabel}
          </ButtonLink>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-[rgb(var(--color-success-rgb)/0.3)] bg-[rgb(var(--color-success-rgb)/0.1)] px-3 py-1 text-xs font-semibold text-[var(--color-success)]"
            title="دارای نماد اعتماد الکترونیکی"
          >
            <IconShield className="h-3.5 w-3.5" aria-hidden="true" />
            {hero.trustPills[0]}
          </span>
          {hero.trustPills.slice(1).map((pill) => (
            <span
              key={pill}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]"
            >
              <IconCheck className="h-3.5 w-3.5 text-[var(--color-success)]" aria-hidden="true" />
              {pill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
