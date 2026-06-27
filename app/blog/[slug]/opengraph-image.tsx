import { ImageResponse } from 'next/og';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';
export const runtime = 'nodejs';

export default async function OpenGraphImage({ params }: PageProps) {
  const { slug } = await params;
  const photoUrl = `https://picsum.photos/seed/${encodeURIComponent(slug)}/1200/630`;

  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', overflow: 'hidden' }}>
      <img
        src={photoUrl}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>,
    size,
  );
}
