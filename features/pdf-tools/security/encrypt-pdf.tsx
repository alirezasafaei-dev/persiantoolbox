'use client';

import { Card } from '@/components/ui';
import Alert from '@/shared/ui/Alert';

export default function EncryptPdfPage() {
  return (
    <div className="space-y-6">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">رمزگذاری PDF</h1>
          <p className="text-lg text-[var(--text-secondary)]">افزودن رمز عبور به فایل PDF</p>
        </div>

        <Card className="p-6 space-y-4">
          <Alert variant="warning">
            در حال حاضر رمزگذاری PDF در مرورگر با کتابخانه های فعلی پشتیبانی نمی شود.
          </Alert>
          <div className="text-sm text-[var(--text-secondary)] space-y-2">
            <p>
              برای حفظ حریم خصوصی، پردازش ها باید به صورت محلی انجام شوند و استفاده از سرویس خارجی
              مجاز نیست.
            </p>
            <p>در فاز بعدی، راهکار جایگزین یا کتابخانه سازگار با رمزگذاری اضافه خواهد شد.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
