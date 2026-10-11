import ChatWorkspace from '@/components/ai/ChatWorkspace';
import { aiFeatureEnabled } from '@/lib/ai/quota';
import { buildMetadata } from '@/lib/seo';

const enabled = aiFeatureEnabled();
export const metadata = buildMetadata({
  title: 'چت هوش مصنوعی فارسی رایگان | جعبه ابزار فارسی',
  description:
    'فضای گفت‌وگوی فارسی برای پرسش‌وپاسخ، یادگیری و نوشتن؛ تاریخچه محلی اختیاری و ظرفیت رایگان محدود.',
  path: '/ai/chat',
  keywords: ['چت هوش مصنوعی فارسی', 'چت بات فارسی', 'چت آنلاین هوش مصنوعی'],
  robots: { index: enabled, follow: true },
});
export default function AiChatPage() {
  return (
    <main id="main-content">
      <ChatWorkspace enabled={enabled} />
    </main>
  );
}
