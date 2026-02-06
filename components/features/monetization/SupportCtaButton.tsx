'use client';

import { analytics } from '@/lib/monitoring';
import { getButtonClasses, type ButtonSize, type ButtonVariant } from '@/shared/ui/buttonStyles';

type Props = {
  href: string;
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

export default function SupportCtaButton({
  href,
  label,
  variant = 'secondary',
  size = 'sm',
  className,
}: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={getButtonClasses({ variant, size, className })}
      onClick={() => analytics.trackEvent('support_cta_click', { href })}
    >
      {label}
    </a>
  );
}
