import ButtonLink from '@/shared/ui/ButtonLink';
import { getHomeHeroCopy } from '@/lib/home-copy';
import { IconCheck } from '@/shared/ui/icons';
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
      className="hero-section relative overflow-hidden p-6 md:p-10 lg:p-14"
      aria-labelledby="hero-heading"
    >
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
          <ButtonLink href="/search" size="lg" className="px-8">
            {hero.primaryCta} ←
          </ButtonLink>
          <ButtonLink href="#popular-tools-heading" variant="secondary" size="lg" className="px-8">
            {hero.secondaryCtaLabel}
          </ButtonLink>
        </div>

        <div
          className="mx-auto grid max-w-3xl grid-cols-2 gap-2 pt-2 sm:grid-cols-3 lg:grid-cols-6"
          aria-label="مزیت‌های اعتماد"
        >
          {hero.trustPills.map((pill) => (
            <span
              key={pill}
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-2 text-xs font-bold text-[var(--text-secondary)]"
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
