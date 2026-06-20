import type { Metadata } from 'next';
import { siteUrl, defaultOgImage } from '@/lib/seo';
import type { ToolEntry } from '@/lib/tools-registry';
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateSoftwareApplicationSchema,
} from '@/lib/seo';

type ToolMetadataInput = {
  tool: ToolEntry;
  faq?: Array<{ question: string; answer: string }>;
  relatedTools?: Array<{ title: string; path: string }>;
};

export function createToolMetadata(input: ToolMetadataInput): Metadata {
  const toolTitle = input.tool.title.replace(/ - جعبه ابزار فارسی/g, '');
  const absoluteUrl = new URL(input.tool.path, siteUrl).toString();

  const title = `${toolTitle} آنلاین رایگان | جعبه ابزار فارسی`;
  const description =
    input.tool.description ??
    `${toolTitle} به‌صورت رایگان و آنلاین در مرورگر خود استفاده کنید. پردازش محلی و امن.`;

  const metadata: Metadata = {
    title,
    description,
    alternates: {
      canonical: absoluteUrl,
    },
    openGraph: {
      title: toolTitle,
      description,
      url: absoluteUrl,
      siteName: 'جعبه ابزار فارسی',
      locale: 'fa_IR',
      type: 'website',
      images: [
        {
          url: defaultOgImage,
          width: 1200,
          height: 630,
          alt: toolTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: toolTitle,
      description,
      images: [defaultOgImage],
    },
  };

  return metadata;
}

export function generateToolJsonLd({
  tool,
  faq,
}: {
  tool: ToolEntry;
  faq?: Array<{ question: string; answer: string }>;
}) {
  const toolTitle = tool.title.replace(/ - جعبه ابزار فارسی/g, '');
  const absoluteUrl = new URL(tool.path, siteUrl).toString();
  const schemas: unknown[] = [];

  schemas.push(
    generateSoftwareApplicationSchema(
      toolTitle,
      tool.description ?? `${toolTitle} ابزار آنلاین رایگان`,
      absoluteUrl,
    ),
  );

  schemas.push(
    ...generateBreadcrumbSchema([
      { name: 'خانه', item: siteUrl },
      {
        name: tool.category?.name ?? 'ابزارها',
        item: new URL(tool.category?.path ?? '/tools', siteUrl).toString(),
      },
      { name: toolTitle },
    ]).itemListElement.map((item: { [key: string]: unknown }) => ({
      ...item,
      '@context': 'https://schema.org',
    })),
  );

  if (faq && faq.length > 0) {
    schemas.push(generateFAQSchema(faq));
  }

  return {
    '@context': 'https://schema.org',
    '@graph': schemas,
  };
}

export function generateToolFaqContent(
  toolId: string,
): Array<{ question: string; answer: string }> {
  const commonFaq: Record<string, Array<{ question: string; answer: string }>> = {
    'pdf-tools': [
      {
        question: 'آیا فایل‌های PDF من آپلود می‌شوند؟',
        answer: 'خیر، تمام پردازش‌ها در مرورگر شما انجام می‌شود و فایل‌ها به سرور ارسال نمی‌شوند.',
      },
      {
        question: 'آیا این ابزار روی موبایل کار می‌کند؟',
        answer: 'بله، رابط کاربری واکنش‌گرا است و روی موبایل و تبلت قابل استفاده است.',
      },
      {
        question: 'آیا خروجی واترمارک دارد؟',
        answer: 'خیر، خروجی بدون واترمارک و علامت تجاری تحویل داده می‌شود.',
      },
      {
        question: 'محدودیت حجم فایل چقدر است؟',
        answer: 'بسته به مرورگر و حافظه دستگاه، معمولاً فایل‌های تا ۱۰۰ مگابایت پشتیبانی می‌شوند.',
      },
    ],
    'image-tools': [
      {
        question: 'آیا فایل‌های تصویری آپلود می‌شوند؟',
        answer: 'خیر، تمام پردازش‌ها در مرورگر انجام می‌شود.',
      },
      {
        question: 'چه فرمت‌هایی پشتیبانی می‌شود؟',
        answer: 'فرمت‌های رایج مثل JPG، PNG و WebP پشتیبانی می‌شوند.',
      },
    ],
    'date-tools': [
      {
        question: 'آیا تبدیل تاریخ دقیق است؟',
        answer:
          'بله، الگوریتم‌های تبدیل بر اساس استانداردهای تقویم شمسی و میلادی پیاده‌سازی شده‌اند.',
      },
    ],
    'text-tools': [
      {
        question: 'آیا متن‌های انگلیسی هم پشتیبانی می‌شود؟',
        answer: 'بله، برخی ابزارها مثل شمارش کلمات برای متن انگلیسی هم کاربرد دارند.',
      },
    ],
    'finance-tools': [
      {
        question: 'آیا ابزارهای مالی اطلاعات من را ذخیره می‌کنند؟',
        answer:
          'خیر. محاسبات به‌صورت محلی انجام می‌شود و داده‌های شما به سرویس خارجی ارسال نمی‌شوند.',
      },
      {
        question: 'آیا نتایج ابزارها قطعی و حقوقی هستند؟',
        answer:
          'خیر. خروجی‌ها برای برآورد سریع هستند و برای عدد قطعی باید با قرارداد یا ضوابط رسمی تطبیق داده شوند.',
      },
    ],
    'validation-tools': [
      {
        question: 'آیا ابزارهای اعتبارسنجی رایگان هستند؟',
        answer: 'بله، تمام ابزارها کاملاً رایگان و بدون نیاز به ثبت‌نام هستند.',
      },
    ],
  };

  const categoryId = toolId.split('-')[0];
  return commonFaq[`${categoryId}-tools`] ?? commonFaq['pdf-tools'] ?? [];
}
