import { ImageResponse } from 'next/og';
import { siteDescription, siteName } from '@/lib/seo';
import { loadOgFont } from '@/lib/og-font';

export const size = {
  width: 1200,
  height: 600,
};

export const contentType = 'image/png';
export const runtime = 'nodejs';

export default async function TwitterImage() {
  const fontData = await loadOgFont();
  try {
    return new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#111827',
          backgroundImage: 'linear-gradient(145deg, #0f172a 0%, #1f2937 40%, #22c55e 100%)',
          color: '#f9fafb',
          fontFamily: 'Vazirmatn',
          padding: '60px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              backgroundColor: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 700,
              color: '#f9fafb',
            }}
          >
            PT
          </div>
          <span style={{ fontSize: '28px', fontWeight: 700, opacity: 0.9 }}>{siteName}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '48px', fontWeight: 700, lineHeight: 1.3 }}>
            ابزارهای آنلاین فارسی
          </div>
          <div style={{ fontSize: '22px', opacity: 0.7, lineHeight: 1.5 }}>{siteDescription}</div>
        </div>
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
  } catch {
    return new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#111827',
          color: '#f9fafb',
          fontFamily: 'Vazirmatn',
          fontSize: 48,
          fontWeight: 700,
        }}
      >
        {siteName}
      </div>,
      {
        ...size,
        fonts: fontData
          ? [{ name: 'Vazirmatn', data: fontData, weight: 700, style: 'normal' }]
          : [],
      },
    );
  }
}
