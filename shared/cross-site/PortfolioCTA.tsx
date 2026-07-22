'use client';

import Link from 'next/link';
import { ANALYTICS_EVENTS, trackAnalyticsEvent } from '@/shared/analytics/events';
import { IconWrench, IconLightbulb, IconZap, IconCode } from '@/shared/ui/icons';

interface PortfolioCTAProps {
  variant: 'footer' | 'tool-result' | 'premium-gate' | 'sidebar';
  toolId?: string;
  className?: string;
}

export function PortfolioCTA({ variant, toolId, className = '' }: PortfolioCTAProps) {
  const handleClick = () => {
    trackAnalyticsEvent(ANALYTICS_EVENTS.CTA_CLICK, {
      variant,
      destination: 'portfolio',
      toolId,
    });
  };

  const content = {
    footer: {
      Icon: IconWrench,
      text: 'ساخته شده توسط علیرضا صفائی',
      subtitle: 'مهندس سیستم‌های وب',
      href: 'https://alirezasafaeisystems.ir/?utm_source=toolbox&utm_medium=footer&utm_campaign=cross_site',
      style:
        'bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700',
    },
    'tool-result': {
      Icon: IconLightbulb,
      text: 'نیاز به توسعه اختصاصی دارید؟',
      subtitle: 'مشاوره رایگان دریافت کنید',
      href: 'https://alirezasafaeisystems.ir/?utm_source=toolbox&utm_medium=tool_result&utm_campaign=conversion',
      style:
        'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800',
    },
    'premium-gate': {
      Icon: IconZap,
      text: 'نیاز به قابلیت‌های پیشرفته‌تر دارید؟',
      subtitle: 'اشتراک پریمیوم یا توسعه اختصاصی',
      href: 'https://alirezasafaeisystems.ir/?utm_source=toolbox&utm_medium=premium_gate&utm_campaign=saas',
      style:
        'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border border-amber-200 dark:border-amber-800',
    },
    sidebar: {
      Icon: IconCode,
      text: 'توسعه‌دهنده این ابزار',
      subtitle: 'علیرضا صفائی - مهندس سیستم‌های وب',
      href: 'https://alirezasafaeisystems.ir/?utm_source=toolbox&utm_medium=sidebar&utm_campaign=branding',
      style:
        'bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950 border border-green-200 dark:border-green-800',
    },
  }[variant];

  return (
    <Link
      href={content.href}
      onClick={handleClick}
      className={`block p-4 rounded-lg hover:shadow-[var(--shadow-medium)] transition-all ${content.style} ${className}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="flex items-center gap-3">
        <content.Icon className="w-6 h-6 text-[var(--text-muted)]" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {content.text}
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300 mt-1">{content.subtitle}</div>
        </div>
        <svg
          aria-hidden="true"
          className="w-5 h-5 text-slate-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
