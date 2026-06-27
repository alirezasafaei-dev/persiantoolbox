import { ImageResponse } from 'next/og';
import { getPostBySlug } from '@/lib/blog';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';
export const runtime = 'nodejs';

function hashText(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function pickPhotoQuery(slug: string, category: string, tags: string[]): string {
  const searchText = `${slug} ${category} ${tags.join(' ')}`.toLowerCase();

  if (/pdf|document|legal|invoice|resume|contract/.test(searchText)) {
    return 'business,documents,desk';
  }
  if (/image|ocr|background|photo/.test(searchText)) {
    return 'photography,camera,workspace';
  }
  if (/date|calendar|shamsi|gregorian/.test(searchText)) {
    return 'calendar,planning,desk';
  }
  if (/validation|national-id|id/.test(searchText)) {
    return 'checklist,document,office';
  }
  if (/salary|hiring|overtime|leave|severance|retirement/.test(searchText)) {
    return 'human-resources,office,team';
  }
  if (/tax|vat|loan|mahr|bank|currency|inflation|investment|financial|profit|purchasing/.test(searchText)) {
    return 'finance,calculator,charts';
  }
  if (/text|case|json|address|number|qr/.test(searchText)) {
    return 'laptop,writing,workspace';
  }
  if (/seo|growth|premium|bookmark/.test(searchText)) {
    return 'marketing,analytics,office';
  }

  return 'modern,office,workspace';
}

function buildPhotoUrl(slug: string, category: string, tags: string[]): string {
  const query = pickPhotoQuery(slug, category, tags);
  const lock = hashText(slug) % 100000;
  return `https://loremflickr.com/1200/630/${query}?lock=${lock}`;
}

export default async function OpenGraphImage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const photoUrl = buildPhotoUrl(slug, post.category, post.tags);

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
