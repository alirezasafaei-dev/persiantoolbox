'use client';

import { useEffect, useState } from 'react';
import { IconShield, IconZap, IconHeart } from '@/shared/ui/icons';
import { toPersianNumbers } from '@/shared/utils/localization/persian';

type Props = {
  toolsCount: number;
};

export default function SocialProofSection({ toolsCount }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const badges = [
    {
      icon: <IconShield className="h-4 w-4" />,
      label: 'حریم خصوصی',
      tone: 'text-[var(--color-success)] bg-[rgb(var(--color-success-rgb)/0.1)] border-[rgb(var(--color-success-rgb)/0.2)]',
    },
    {
      icon: <IconHeart className="h-4 w-4" />,
      label: 'رایگان',
      tone: 'text-[var(--color-info)] bg-[rgb(var(--color-info-rgb)/0.1)] border-[rgb(var(--color-info-rgb)/0.2)]',
    },
    {
      icon: <IconZap className="h-4 w-4" />,
      label: 'سریع',
      tone: 'text-[var(--color-warning)] bg-[rgb(var(--color-warning-rgb)/0.1)] border-[rgb(var(--color-warning-rgb)/0.2)]',
    },
  ];

  return (
    <section
      className="rounded-[var(--radius-lg)] border border-[rgb(var(--color-primary-rgb)/0.2)] bg-gradient-to-l from-[rgb(var(--color-primary-rgb)/0.04)] to-transparent p-8"
      aria-labelledby="social-proof-heading"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className={`transition-all duration-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
        >
          <h2
            id="social-proof-heading"
            className="text-xl font-bold text-[var(--text-primary)] md:text-2xl"
          >
            هزاران کاربر از ابزارهای ما استفاده می‌کنند
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            بیش از {toPersianNumbers(toolsCount)} ابزار کاربردی، همگی با پردازش محلی و بدون نیاز به
            ثبت‌نام
          </p>
        </div>

        <div
          className={`flex flex-wrap justify-center gap-3 transition-all duration-500 delay-150 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
        >
          {badges.map((badge) => (
            <div
              key={badge.label}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 hover:scale-105 ${badge.tone}`}
            >
              {badge.icon}
              {badge.label}
            </div>
          ))}
        </div>

        <div
          className={`flex items-center gap-1 text-xs text-[var(--text-muted)] transition-all duration-500 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
          فعال و در دسترس — بدون قطعی
        </div>
      </div>
    </section>
  );
}
