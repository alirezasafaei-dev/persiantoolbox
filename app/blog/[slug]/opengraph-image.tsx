import { ImageResponse } from 'next/og';
import { siteName } from '@/lib/seo';
import { loadOgFont } from '@/lib/og-font';
import { getPostBySlug, isBlogPostVisible } from '@/lib/blog';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function OpenGraphImage({ params }: PageProps) {
  const { slug } = await params;
  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    post = null;
  }

  if (!post || !isBlogPostVisible(post)) {
    return new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f8fafc',
          fontSize: '32px',
          fontFamily: 'Vazirmatn',
        }}
      >
        جعبه ابزار فارسی
      </div>,
      { ...size },
    );
  }

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
        backgroundImage: 'linear-gradient(145deg, #0f172a 0%, #1e293b 40%, #7c3aed 100%)',
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
            backgroundColor: '#7c3aed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
          }}
        >
          مج
        </div>
        <span style={{ fontSize: '32px', fontWeight: 700, opacity: 0.9 }}>{siteName}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignSelf: 'flex-start',
            padding: '8px 20px',
            borderRadius: '12px',
            backgroundColor: 'rgba(124, 58, 237, 0.3)',
            border: '1px solid rgba(124, 58, 237, 0.5)',
            fontSize: '22px',
            fontWeight: 600,
            color: '#c4b5fd',
          }}
        >
          {post.category}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: '48px',
            fontWeight: 700,
            lineHeight: 1.3,
          }}
        >
          {post.title}
        </div>
        <div style={{ fontSize: '22px', opacity: 0.75, lineHeight: 1.5 }}>{post.description}</div>
      </div>

      <div style={{ display: 'flex', gap: '12px', fontSize: '18px', opacity: 0.6 }}>
        <span
          style={{
            padding: '6px 16px',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
          }}
        >
          {post.author}
        </span>
        <span
          style={{
            padding: '6px 16px',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
          }}
        >
          {post.date}
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
