import WordCounterPage from '@/components/features/text-tools/WordCounter';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'شمارنده کلمات و کاراکترها - جعبه ابزار فارسی',
  description:
    'شمارش آنی کلمات، کاراکترها، جملات و پاراگراف‌ها در متن فارسی و انگلیسی. پردازش کاملاً محلی بدون ارسال داده.',
  path: '/text-tools/word-counter',
  keywords: ['شمارنده کلمات', 'شمارش کاراکتر', 'شمارش متن', 'word counter', 'text counter'],
});

export default function WordCounterRoute() {
  return <WordCounterPage />;
}
