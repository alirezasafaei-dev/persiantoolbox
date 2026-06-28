import type { ReactNode } from 'react';
import Link from 'next/link';
import type { ToolEntry } from '@/lib/tools-registry';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ToolTrustBlock from '@/components/ui/ToolTrustBlock';
import RelatedTools from '@/components/ui/RelatedTools';
import SiteAdBanner from '@/components/ui/SiteAdBanner';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';
import ToolBlogCTA from '@/components/features/tools/ToolBlogCTA';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import ToolUsageIndicator from '@/components/ui/ToolUsageIndicator';
import UsageWarning from '@/components/ui/UsageWarning';
import FaqSchema from '@/components/seo/FaqSchema';
import HowToSchema from '@/components/seo/HowToSchema';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import ShareResult from '@/components/ui/ShareResult';
import { siteUrl } from '@/lib/seo';
import { isFeatureEnabled } from '@/lib/features/availability';

type Props = {
  tool: ToolEntry;
  children: ReactNode;
};

export default function ToolPageShell({ tool, children }: Props) {
  const breadcrumbs = [
    { label: 'خانه', href: '/' },
    ...(tool.category ? [{ label: tool.category.name, href: tool.category.path }] : []),
    { label: tool.title.replace(' - جعبه ابزار فارسی', ''), current: true },
  ];

  return (
    <div className="space-y-10">
      {tool.content?.faq ? <FaqSchema faq={tool.content.faq} /> : null}
      {tool.content?.steps ? <HowToSchema name={tool.title} steps={tool.content.steps} /> : null}
      <BreadcrumbSchema
        items={breadcrumbs.map((b) => ({
          name: b.label,
          url: b.href ? `${siteUrl}${b.href}` : '',
        }))}
      />
      <div className="max-w-4xl mx-auto px-4 py-4 md:py-8 space-y-6">
        <Breadcrumbs items={breadcrumbs} />
        {tool.category ? (
          <Link
            href={tool.category.path}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
          >
            <svg
              className="h-4 w-4 rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            بازگشت به {tool.category.name}
          </Link>
        ) : null}

        {/* Trust micro-copy */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span className="text-[var(--color-success)]">🔒</span>
          <span>پردازش محلی — فایل شما ارسال نمی‌شود</span>
          <span className="mx-1">·</span>
          <span>بدون ثبت‌نام</span>
          <span className="mx-1">·</span>
          <span className="flex items-center gap-1 text-[var(--color-success)]">
            <span>✓</span>
            <span>پردازش محلی فعال</span>
          </span>
          <span className="mx-1">·</span>
          <a
            href="/trust"
            className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
          >
            چطور کار می‌کند؟
          </a>
        </div>

        <ToolUsageIndicator toolId={tool.id} />
        {children}
        <UsageWarning />

        {isFeatureEnabled('ads') && <SiteAdBanner placement="tool-after-content" />}

        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--text-muted)]">اشتراک‌گذاری:</span>
          <ShareResult
            title={tool.title.replace(' - جعبه ابزار فارسی', '')}
            text={`ابزار ${tool.title.replace(' - جعبه ابزار فارسی', '')} در جعبه ابزار فارسی`}
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-10">
        {tool.category ? <ToolTrustBlock category={tool.category} /> : null}

        {tool.category ? <RelatedTools currentPath={tool.path} category={tool.category} /> : null}

        <ToolBlogCTA tags={tool.keywords ?? []} />

        <PortfolioCTA variant="tool-result" toolId={tool.id} />

        <ToolSeoContent tool={tool} />
      </div>
    </div>
  );
}
