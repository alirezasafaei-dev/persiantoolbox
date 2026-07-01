import ButtonLink from '@/shared/ui/ButtonLink';
import { getHomeHeroCopy } from '@/lib/home-copy';
import { IconCheck, IconShield } from '@/shared/ui/icons';
import HeroQuickLinks from '@/components/home/HeroQuickLinks';
import dynamic from 'next/dynamic';

const LazyToolSearch = dynamic(() => import('@/components/home/ToolSearch'), {
  loading: () => (
    <div className="mx-auto h-12 max-w-xl animate-pulse rounded-full bg-[var(--surface-1)]" />
  ),
});

type Props = {
  toolCount: number;
  pack3HeroCta: string;
};

export default function HomeHero({ toolCount, pack3HeroCta }: Props) {
  const hero = getHomeHeroCopy(toolCount);

  return (
    <section
      className="section-surface relative overflow-hidden p-6 md:p-10 lg:p-12"
      aria-labelledby="hero-heading"
    >
      <div className="pointer-events-none absolute -top-36 right-1/2 h-72 w-72 translate-x-1/2 rounded-full bg-[rgb(var(--color-primary-rgb)/0.2)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-10 h-60 w-60 rounded-full bg-[rgb(var(--color-success-rgb)/0.16)] blur-3xl" />

      <div className="relative space-y-6 text-center">
        <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
          <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" aria-hidden="true" />
          {hero.eyebrow}
        </p>

        <div className="space-y-3">
          <h1
            id="hero-heading"
            className="text-4xl font-black leading-tight text-[var(--text-primary)] md:text-5xl"
          >
            {hero.title}
          </h1>
          <p className="text-xl font-bold leading-relaxed text-[var(--color-primary)] md:text-2xl">
            {hero.titleAccent}
          </p>
        </div>

        <p className="mx-auto max-w-3xl text-base leading-8 text-[var(--text-secondary)] md:text-lg">
          {hero.subtitle}
        </p>

        <div className="mx-auto max-w-xl">
          <LazyToolSearch />
        </div>

        <HeroQuickLinks />

        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink href="/topics" size="lg" className="px-8">
            {hero.primaryCta} ←
          </ButtonLink>
          <ButtonLink href="/pricing" variant="secondary" size="lg" className="px-8">
            {pack3HeroCta}
          </ButtonLink>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-[var(--text-muted)]">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-[rgb(var(--color-success-rgb)/0.3)] bg-[rgb(var(--color-success-rgb)/0.1)] px-3 py-1 text-[var(--color-success)] font-semibold"
            title="دارای نماد اعتماد الکترونیکی"
          >
            <IconShield className="h-3.5 w-3.5" aria-hidden="true" />
            {hero.trustPills[0]}
          </span>
          {hero.trustPills.slice(1).map((pill) => (
            <span key={pill} className="inline-flex items-center gap-1.5">
              <IconCheck className="h-3.5 w-3.5 text-[var(--color-success)]" aria-hidden="true" />
              {pill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
