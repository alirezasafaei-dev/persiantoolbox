import OpsPageClient from './OpsPageClient';

export const metadata = {
  title: 'عملیات سرور - پنل مدیریت',
  robots: { index: false, follow: false },
};

export default function OpsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-(--text-primary)">عملیات سرور</h1>
        <p className="mt-1 text-sm text-(--text-muted)">وضعیت سلامت سیستم و وابستگی‌ها</p>
      </div>
      <OpsPageClient />
    </div>
  );
}
