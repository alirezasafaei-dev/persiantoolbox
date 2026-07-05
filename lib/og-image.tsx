import { ImageResponse } from 'next/og';
import { siteName } from '@/lib/seo';
import { loadOgFont } from '@/lib/og-font';

export const ogImageSize = { width: 1200, height: 630 };
export const ogImageContentType = 'image/png';
const gradients: Record<string, string> = {
  pdf: 'linear-gradient(140deg, #0b1020 0%, #1f2937 55%, #ef4444 100%)',
  image: 'linear-gradient(140deg, #0b1020 0%, #1f2937 55%, #22c55e 100%)',
  finance: 'linear-gradient(140deg, #0b1020 0%, #1f2937 55%, #2563eb 100%)',
  text: 'linear-gradient(140deg, #0b1020 0%, #1f2937 55%, #a855f7 100%)',
  date: 'linear-gradient(140deg, #0b1020 0%, #1f2937 55%, #f59e0b 100%)',
  validation: 'linear-gradient(140deg, #0b1020 0%, #1f2937 55%, #06b6d4 100%)',
  default: 'linear-gradient(140deg, #0b1020 0%, #1f2937 55%, #2563eb 100%)',
};

export function getCategoryFromPath(path: string): string {
  if (path.includes('/pdf-tools')) {
    return 'pdf';
  }
  if (path.includes('/image-tools')) {
    return 'image';
  }
  if (path.includes('/text-tools')) {
    return 'text';
  }
  if (path.includes('/date-tools')) {
    return 'date';
  }
  if (path.includes('/validation-tools')) {
    return 'validation';
  }
  if (
    path.includes('/tools/') ||
    path.includes('/salary') ||
    path.includes('/interest') ||
    path.includes('/loan')
  ) {
    return 'finance';
  }
  return 'default';
}

export async function createToolOgImage(title: string, path: string): Promise<ImageResponse> {
  const fontData = await loadOgFont();
  const category = getCategoryFromPath(path);
  const gradient = gradients[category] ?? gradients['default'];

  const ogElement = (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#0b1020',
        backgroundImage: gradient,
        color: '#f8fafc',
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
            backgroundColor: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '30px',
          }}
        >
          🧰
        </div>
        <span style={{ fontSize: '28px', fontWeight: 700, opacity: 0.85 }}>{siteName}</span>
      </div>

      <div style={{ fontSize: '52px', fontWeight: 700, lineHeight: 1.3 }}>{title}</div>
    </div>
  );

  try {
    return new ImageResponse(ogElement, {
      ...ogImageSize,
      fonts: [
        {
          name: 'Vazirmatn',
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    });
  } catch (err) {
    // Defensive: a transient failure (e.g. internal rasterizer/fetch in next/og under load)
    // should not kill the entire production build.
    console.error(`[og-image] Fallback for ${path}:`, (err as Error)?.message || err);
    return new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0b1020',
          color: '#f8fafc',
          fontFamily: 'Vazirmatn',
          fontSize: 48,
          fontWeight: 700,
        }}
      >
        {title}
      </div>,
      {
        ...ogImageSize,
        fonts: fontData
          ? [{ name: 'Vazirmatn', data: fontData, weight: 700, style: 'normal' }]
          : [],
      },
    );
  }
}
