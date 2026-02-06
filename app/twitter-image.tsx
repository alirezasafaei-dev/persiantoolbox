import { ImageResponse } from 'next/og';
import { siteName } from '@/lib/seo';
import { loadOgFont } from '@/lib/og-font';

export const size = {
  width: 1200,
  height: 600,
};

export const contentType = 'image/png';
export const runtime = 'nodejs';

export default async function TwitterImage() {
  const fontData = await loadOgFont();
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#111827',
        backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1f2937 60%, #22c55e 100%)',
        color: '#f9fafb',
        fontSize: 56,
        fontWeight: 700,
        fontFamily: 'Vazirmatn',
        textAlign: 'center',
        padding: '60px',
      }}
    >
      {siteName}
    </div>,
    {
      ...size,
      fonts: [
        {
          name: 'Vazirmatn',
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    },
  );
}
