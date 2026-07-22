'use client';

import Link from 'next/link';
import { Card } from '@/components/ui';

type AddressSuccessCtaProps = {
  visible: boolean;
};

export default function AddressSuccessCta({ visible }: AddressSuccessCtaProps) {
  if (!visible) {
    return null;
  }

  return (
    <Card className="p-5 md:p-6 space-y-3 border border-[var(--border-light)] bg-[var(--surface-1)]">
      <div className="text-sm font-bold text-[var(--text-primary)]">تبدیل گروهی آدرس دارید؟</div>
      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
        برای فروشگاه، CRM یا فایل اکسل، نسخه سازمانی و API دریافت کنید.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link href="/contact" className="btn btn-primary btn-sm">
          دریافت نسخه سازمانی
        </Link>
        <a
          href="mailto:alirezasafaeisystems@gmail.com?subject=%D8%A7%D8%B3%D8%AA%D9%81%D8%A7%D8%AF%D9%87%20%D8%A7%D8%B2%20%D8%A7%D8%A8%D8%B2%D8%A7%D8%B1%20%D8%AA%D8%A8%D8%AF%DB%8C%D9%84%20%D8%A2%D8%AF%D8%B1%D8%B3"
          className="btn btn-secondary btn-sm"
        >
          ارسال ایمیل
        </a>
      </div>
    </Card>
  );
}
