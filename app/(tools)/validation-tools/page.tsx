import QrCodeGenerator from '@/components/features/validation-tools/QrCodeGenerator';
import PasswordGenerator from '@/components/features/validation-tools/PasswordGenerator';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'ابزارهای اعتبارسنجی - جعبه ابزار فارسی',
  description: 'ابزارهای اعتبارسنجی و تولید QR Code برای کاربران فارسی‌زبان.',
  path: '/validation-tools',
});

export default function ValidationToolsPage() {
  return (
    <div className="space-y-6">
      <div className="section-surface p-6 md:p-8 rounded-[var(--radius-lg)] border border-[var(--border-light)]">
        <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] mb-4">
          ابزارهای اعتبارسنجی
        </h1>
        <p className="text-[var(--text-secondary)]">
          ابزارهای حرفه‌ای برای اعتبارسنجی، تولید رمز عبور و QR Code.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <QrCodeGenerator />
        <PasswordGenerator />
      </div>

      <div className="section-surface p-6 rounded-[var(--radius-lg)] border border-[var(--border-light)]">
        <h3 className="text-lg font-black text-[var(--text-primary)] mb-4">ابزارهای بیشتر</h3>
        <ul className="space-y-3 text-sm text-[var(--text-muted)]">
          <li>🔍 اعتبارسنجی کد ملی</li>
          <li>📱 اعتبارسنجی شماره موبایل</li>
          <li>💳 اعتبارسنجی شماره کارت</li>
          <li>🏦 اعتبارسنجی شماره شبا</li>
          <li>📍 اعتبارسنجی کد پستی</li>
          <li>✉️ اعتبارسنجی ایمیل</li>
        </ul>
      </div>
    </div>
  );
}
