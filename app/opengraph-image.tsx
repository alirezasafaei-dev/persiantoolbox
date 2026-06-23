import { ImageResponse } from 'next/og';
import { siteDescription, siteName } from '@/lib/seo';
import { loadOgFont } from '@/lib/og-font';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';
export const runtime = 'nodejs';

export default async function OpenGraphImage() {
  const fontData = await loadOgFont();
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#0f172a',
        backgroundImage: 'linear-gradient(145deg, #0f172a 0%, #1e293b 40%, #2563eb 100%)',
        color: '#f8fafc',
        fontFamily: 'Vazirmatn',
        padding: '60px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
          }}
        >
          🧰
        </div>
        <span style={{ fontSize: '32px', fontWeight: 700, opacity: 0.9 }}>{siteName}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ fontSize: '56px', fontWeight: 700, lineHeight: 1.3 }}>۵۵ ابزار آنلاین</div>
        <div style={{ fontSize: '24px', opacity: 0.75, lineHeight: 1.5 }}>{siteDescription}</div>
      </div>

      <div style={{ display: 'flex', gap: '12px', fontSize: '18px', opacity: 0.6 }}>
        <span
          style={{
            padding: '6px 16px',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
          }}
        >
          PDF
        </span>
        <span
          style={{
            padding: '6px 16px',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
          }}
        >
          تصویر
        </span>
        <span
          style={{
            padding: '6px 16px',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
          }}
        >
          مالی
        </span>
        <span
          style={{
            padding: '6px 16px',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
          }}
        >
          متن
        </span>
        <span
          style={{
            padding: '6px 16px',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
          }}
        >
          تاریخ
        </span>
        <span
          style={{
            padding: '6px 16px',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
          }}
        >
          اعتبارسنجی
        </span>
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
}
