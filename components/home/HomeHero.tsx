import ButtonLink from '@/shared/ui/ButtonLink';
import { getHomeHeroCopy } from '@/lib/home-copy';
import { IconCheck } from '@/shared/ui/icons';
import HeroQuickLinks from '@/components/home/HeroQuickLinks';
import LazyToolSearch from '@/components/home/LazyToolSearch';
import styles from '@/components/home/HomeRefresh.module.css';

type Props = {
  toolCount: number;
};

export default function HomeHero({ toolCount }: Props) {
  const hero = getHomeHeroCopy(toolCount);

  return (
    <section
      className={`hero-section relative overflow-hidden p-6 md:p-10 lg:p-14 ${styles['heroShell']}`}
      aria-labelledby="hero-heading"
    >
      <span className={`${styles['decoration']} ${styles['decorationStart']}`} aria-hidden="true" />
      <span className={`${styles['decoration']} ${styles['decorationEnd']}`} aria-hidden="true" />
      <div className={`relative space-y-6 text-center ${styles['heroContent']}`}>
        <p
          className={`mx-auto inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold ${styles['eyebrow']}`}
        >
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" aria-hidden="true" />
          {hero.eyebrow}
        </p>

        <div className="space-y-3">
          <h1
            id="hero-heading"
            className="text-4xl font-black leading-tight text-(--text-primary) md:text-5xl lg:text-6xl"
          >
            {hero.title}
          </h1>
          <p className="text-xl font-bold leading-relaxed text-primary md:text-2xl">
            {hero.titleAccent}
          </p>
        </div>

        <p className="mx-auto max-w-2xl text-base leading-8 text-(--text-secondary) md:text-lg">
          {hero.subtitle}
        </p>

        <div className={`mx-auto max-w-2xl ${styles['searchFrame']}`}>
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
          className={`mx-auto max-w-3xl gap-2 pt-2 ${styles['trustPills']}`}
          aria-label="مزیت‌های اعتماد"
        >
          {hero.trustPills.map((pill) => (
            <span
              key={pill}
              className={`inline-flex min-h-10 items-center justify-center gap-1.5 border border-(--border-light) px-3 py-2 text-xs font-bold text-(--text-secondary) ${styles['trustPill']}`}
            >
              <IconCheck className="h-3.5 w-3.5 text-success" aria-hidden="true" />
              {pill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
