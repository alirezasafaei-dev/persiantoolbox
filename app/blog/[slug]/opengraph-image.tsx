import { ImageResponse } from 'next/og';
import { siteName } from '@/lib/seo';
import { loadOgFont } from '@/lib/og-font';
import { getPostBySlug } from '@/lib/blog';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';
export const runtime = 'nodejs';

type PageProps = {
  params: Promise<{ slug: string }>;
};

type VisualTheme = {
  icon: string;
  label: string;
  background: string;
  accent: string;
  soft: string;
  chipText: string;
  pattern: string;
};

const THEMES: Record<string, VisualTheme> = {
  finance: {
    icon: '💰',
    label: 'Financial tools',
    background: 'linear-gradient(145deg, #052e16 0%, #064e3b 45%, #16a34a 100%)',
    accent: '#22c55e',
    soft: 'rgba(34, 197, 94, 0.22)',
    chipText: '#bbf7d0',
    pattern: '٪',
  },
  work: {
    icon: '👥',
    label: 'Work & payroll',
    background: 'linear-gradient(145deg, #172554 0%, #1e3a8a 45%, #2563eb 100%)',
    accent: '#60a5fa',
    soft: 'rgba(96, 165, 250, 0.22)',
    chipText: '#bfdbfe',
    pattern: '₮',
  },
  document: {
    icon: '📄',
    label: 'Documents',
    background: 'linear-gradient(145deg, #312e81 0%, #4c1d95 45%, #7c3aed 100%)',
    accent: '#a78bfa',
    soft: 'rgba(167, 139, 250, 0.24)',
    chipText: '#ddd6fe',
    pattern: '§',
  },
  image: {
    icon: '🖼️',
    label: 'Image workflow',
    background: 'linear-gradient(145deg, #164e63 0%, #155e75 45%, #06b6d4 100%)',
    accent: '#67e8f9',
    soft: 'rgba(103, 232, 249, 0.22)',
    chipText: '#cffafe',
    pattern: '◐',
  },
  text: {
    icon: '✍️',
    label: 'Text productivity',
    background: 'linear-gradient(145deg, #431407 0%, #7c2d12 45%, #f97316 100%)',
    accent: '#fdba74',
    soft: 'rgba(253, 186, 116, 0.22)',
    chipText: '#ffedd5',
    pattern: 'Aa',
  },
  security: {
    icon: '🔐',
    label: 'Security',
    background: 'linear-gradient(145deg, #111827 0%, #374151 48%, #ef4444 100%)',
    accent: '#fca5a5',
    soft: 'rgba(252, 165, 165, 0.2)',
    chipText: '#fee2e2',
    pattern: '#',
  },
  date: {
    icon: '📅',
    label: 'Date tools',
    background: 'linear-gradient(145deg, #581c87 0%, #7e22ce 45%, #d946ef 100%)',
    accent: '#f0abfc',
    soft: 'rgba(240, 171, 252, 0.22)',
    chipText: '#fae8ff',
    pattern: '۱۴۰۴',
  },
  validation: {
    icon: '✅',
    label: 'Validation',
    background: 'linear-gradient(145deg, #042f2e 0%, #0f766e 45%, #14b8a6 100%)',
    accent: '#5eead4',
    soft: 'rgba(94, 234, 212, 0.22)',
    chipText: '#ccfbf1',
    pattern: '✓',
  },
  growth: {
    icon: '🚀',
    label: 'Growth',
    background: 'linear-gradient(145deg, #450a0a 0%, #991b1b 45%, #f59e0b 100%)',
    accent: '#fcd34d',
    soft: 'rgba(252, 211, 77, 0.22)',
    chipText: '#fef3c7',
    pattern: '↗',
  },
  default: {
    icon: '🧰',
    label: 'PersianToolbox guide',
    background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 45%, #7c3aed 100%)',
    accent: '#c4b5fd',
    soft: 'rgba(196, 181, 253, 0.22)',
    chipText: '#ede9fe',
    pattern: 'PT',
  },
};

function pickTheme(slug: string, category: string, tags: string[]): VisualTheme {
  const searchText = `${slug} ${category} ${tags.join(' ')}`.toLowerCase();

  if (/password|hash|base64|security|امنیت|رمز/.test(searchText)) return THEMES.security;
  if (/pdf|document|legal|invoice|resume|contract|سند|قرارداد|رزومه|فاکتور/.test(searchText)) {
    return THEMES.document;
  }
  if (/image|ocr|background|تصویر|عکس|پس‌زمینه/.test(searchText)) return THEMES.image;
  if (/date|calendar|shamsi|gregorian|تاریخ|تقویم|شمسی/.test(searchText)) return THEMES.date;
  if (/validation|national-id|شناسه|اعتبار|کد ملی/.test(searchText)) return THEMES.validation;
  if (/salary|hiring|overtime|leave|severance|retirement|کارمند|حقوق|استخدام|مرخصی|سنوات/.test(searchText)) {
    return THEMES.work;
  }
  if (/tax|vat|loan|mahr|bank|currency|inflation|investment|financial|profit|purchasing|مالی|مالیات|وام|ارز|تورم|سرمایه|سود|مهریه/.test(searchText)) {
    return THEMES.finance;
  }
  if (/text|case|json|address|number|qr|متن|آدرس|عدد/.test(searchText)) return THEMES.text;
  if (/seo|growth|premium|bookmark|بازاریابی|رشد/.test(searchText)) return THEMES.growth;

  return THEMES.default;
}

function shortTitle(title: string): string {
  return title.length > 62 ? `${title.slice(0, 59)}…` : title;
}

export default async function OpenGraphImage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const fontData = await loadOgFont();
  const theme = pickTheme(slug, post.category, post.tags);
  const tags = post.tags.slice(0, 3);

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#0f172a',
        backgroundImage: theme.background,
        color: '#f8fafc',
        fontFamily: 'Vazirmatn',
        padding: '58px 64px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 18% 20%, rgba(255,255,255,0.18) 0, transparent 24%), radial-gradient(circle at 86% 72%, rgba(255,255,255,0.16) 0, transparent 28%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 58,
          bottom: 34,
          fontSize: 156,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.08)',
          transform: 'rotate(-8deg)',
        }}
      >
        {theme.pattern}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '74px',
              height: '74px',
              borderRadius: '22px',
              backgroundColor: theme.soft,
              border: `1px solid ${theme.accent}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              boxShadow: '0 18px 50px rgba(0,0,0,0.22)',
            }}
          >
            {theme.icon}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '31px', fontWeight: 700, opacity: 0.95 }}>{siteName}</span>
            <span style={{ fontSize: '17px', color: theme.chipText, opacity: 0.9 }}>{theme.label}</span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            padding: '8px 18px',
            borderRadius: '999px',
            backgroundColor: 'rgba(15, 23, 42, 0.35)',
            border: '1px solid rgba(255,255,255,0.2)',
            fontSize: '19px',
            color: theme.chipText,
          }}
        >
          {post.category}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '900px' }}>
        <div
          style={{
            display: 'flex',
            fontSize: '52px',
            fontWeight: 700,
            lineHeight: 1.22,
            letterSpacing: '-0.02em',
          }}
        >
          {shortTitle(post.title)}
        </div>
        <div style={{ fontSize: '23px', color: 'rgba(248,250,252,0.78)', lineHeight: 1.55 }}>
          {post.description}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {tags.map((tag) => (
            <span
              key={tag}
              style={{
                padding: '7px 15px',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '999px',
                backgroundColor: 'rgba(15,23,42,0.28)',
                fontSize: '18px',
                color: theme.chipText,
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px', fontSize: '17px', opacity: 0.76 }}>
          <span>{post.author}</span>
          <span>•</span>
          <span>{post.date}</span>
        </div>
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
