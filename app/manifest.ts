import type { MetadataRoute } from 'next';
import { siteDescription, siteName } from '@/lib/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: 'Persian Tools',
    description: siteDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f7fb',
    theme_color: '#2563eb',
    lang: 'fa-IR',
    dir: 'rtl',
    icons: [
      {
        src: '/android-chrome-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
