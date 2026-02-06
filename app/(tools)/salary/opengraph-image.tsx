import { ImageResponse } from 'next/og';
import { siteName } from '@/lib/seo';
import { loadOgFont } from '@/lib/og-font';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';
export const runtime = 'nodejs';

const title = 'محاسبه‌گر حقوق';

export default async function OpenGraphImage() {
  const fontData = await loadOgFont();
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0b1325',
        backgroundImage: 'linear-gradient(140deg, #0b1325 0%, #1e293b 55%, #f97316 100%)',
        color: '#f8fafc',
        fontSize: 64,
        fontWeight: 700,
        fontFamily: 'Vazirmatn',
        textAlign: 'center',
        padding: '60px',
      }}
    >
      {title} | {siteName}
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
