'use client';

import { useEffect, useState } from 'react';
import type { PublicSiteSettings } from '@/lib/siteSettings';

export default function FooterDynamic() {
  const [socialLinks, setSocialLinks] = useState<
    Array<{ label: string; url: string; icon: string }>
  >([]);

  useEffect(() => {
    fetch('/api/site-settings')
      .then((r) => r.json())
      .then((data: { settings?: PublicSiteSettings }) => {
        if (data.settings) {
          const links = [
            { label: 'تلگرام', url: data.settings.telegramUrl, icon: '✈️' },
            { label: 'اینستاگرام', url: data.settings.instagramUrl, icon: '📸' },
            { label: 'واتساپ', url: data.settings.whatsappUrl, icon: '💬' },
          ].filter((l) => l.url);
          setSocialLinks(links);
        }
      })
      .catch(() => {});
  }, []);

  if (socialLinks.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-2)] p-4">
      <div className="flex flex-wrap items-center justify-center gap-4">
        {socialLinks.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="interactive-link inline-flex items-center gap-2 text-sm"
          >
            <span aria-hidden="true">{link.icon}</span>
            <span>{link.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
