'use client';

import { useEffect, useState } from 'react';
import type { PublicSiteSettings } from '@/lib/siteSettings';

export default function FooterDynamic() {
  const [socialLinks, setSocialLinks] = useState<Array<{ label: string; url: string }>>([]);

  useEffect(() => {
    fetch('/api/site-settings')
      .then((r) => r.json())
      .then((data: { settings?: PublicSiteSettings }) => {
        if (data.settings) {
          const links = [
            { label: 'تلگرام', url: data.settings.telegramUrl },
            { label: 'اینستاگرام', url: data.settings.instagramUrl },
            { label: 'واتساپ', url: data.settings.whatsappUrl },
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
    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-[var(--border-light)] pt-4 text-sm">
      {socialLinks.map((link) => (
        <a
          key={link.label}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="interactive-link"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
