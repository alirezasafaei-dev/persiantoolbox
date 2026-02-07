'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Card } from '@/components/ui';
import { IconShield, IconZap, IconHeart } from '@/shared/ui/icons';
import { analytics } from '@/lib/monitoring';
import {
  exportAdPerformanceReport,
  getAdPerformanceReport,
  getAdStats,
} from '@/shared/analytics/ads';
import {
  clearAdsConsent,
  getAdsConsent,
  type AdsConsentState,
  updateAdsConsent,
} from '@/shared/consent/adsConsent';
import { AdContainer, StaticAdSlot } from '@/shared/ui/AdSlot';

const formatDate = (value: number) =>
  new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export default function AdsTransparencyPage() {
  const [consent, setConsent] = useState<AdsConsentState | null>(null);
  const [slotStats, setSlotStats] = useState<{ views: number; clicks: number }>({
    views: 0,
    clicks: 0,
  });
  const [reportSummary, setReportSummary] = useState<{
    views: number;
    clicks: number;
    ctr: number;
    slots: number;
    variants: number;
    acceptanceRate: number;
    topVariant: string;
  }>({
    views: 0,
    clicks: 0,
    ctr: 0,
    slots: 0,
    variants: 0,
    acceptanceRate: 0,
    topVariant: 'ندارد',
  });

  useEffect(() => {
    setConsent(getAdsConsent());
    const stats = getAdStats('ads-transparency-demo-slot', 30)['ads-transparency-demo-slot'];
    const report = getAdPerformanceReport(30);
    setSlotStats({
      views: stats?.views ?? 0,
      clicks: stats?.clicks ?? 0,
    });
    setReportSummary({
      views: report.totals.views,
      clicks: report.totals.clicks,
      ctr: report.totals.ctr,
      slots: report.totals.slots,
      variants: report.totals.variants,
      acceptanceRate: report.kpis.ux.consentAcceptanceRate,
      topVariant: report.kpis.revenue.topVariantId ?? 'ندارد',
    });
  }, []);

  const statusText = useMemo(() => {
    if (!consent) {
      return 'در حال خواندن تنظیمات…';
    }
    if (!consent.contextualAds && !consent.targetedAds) {
      return 'تبلیغات غیرفعال است و بدون رضایت شما نمایش داده نمی‌شود.';
    }
    if (consent.contextualAds && !consent.targetedAds) {
      return 'تبلیغات زمینه‌ای با رضایت شما فعال است.';
    }
    return 'تبلیغات هدفمند با رضایت جداگانه فعال است.';
  }, [consent]);

  const updateConsent = (patch: Partial<AdsConsentState>) => {
    const next = updateAdsConsent(patch);
    setConsent(next);
    analytics.trackEvent('ads_consent_change', {
      contextualAds: next.contextualAds,
      targetedAds: next.targetedAds,
    });
  };

  const resetConsent = () => {
    const next = clearAdsConsent();
    setConsent(next);
    analytics.trackEvent('ads_consent_reset');
  };

  const refreshStats = () => {
    const stats = getAdStats('ads-transparency-demo-slot', 30)['ads-transparency-demo-slot'];
    const report = getAdPerformanceReport(30);
    setSlotStats({
      views: stats?.views ?? 0,
      clicks: stats?.clicks ?? 0,
    });
    setReportSummary({
      views: report.totals.views,
      clicks: report.totals.clicks,
      ctr: report.totals.ctr,
      slots: report.totals.slots,
      variants: report.totals.variants,
      acceptanceRate: report.kpis.ux.consentAcceptanceRate,
      topVariant: report.kpis.revenue.topVariantId ?? 'ندارد',
    });
  };

  const downloadPeriodicReport = () => {
    const report = exportAdPerformanceReport(30);
    const blob = new Blob([report], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'ad-metrics-report-30d.json';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const contextualEnabled = consent?.contextualAds ?? false;
  const targetedEnabled = consent?.targetedAds ?? false;
  const canToggleTargeted = contextualEnabled;

  return (
    <div className="space-y-10">
      <section className="section-surface p-6 md:p-8">
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]"></span>
            شفافیت تبلیغات
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)]">
            تبلیغات با احترام به حریم خصوصی
          </h1>
          <p className="text-[var(--text-secondary)] leading-7">
            ما به پردازش محلی و عدم ارسال فایل‌ها متعهدیم. هیچ اسکریپت تبلیغاتی شبکه‌ای بدون رضایت
            شما بارگذاری نمی‌شود و می‌توانید هر زمان تنظیمات را تغییر دهید.
          </p>
          <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            وضعیت فعلی:{' '}
            <span className="font-semibold text-[var(--text-primary)]">{statusText}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: 'پیش‌فرض بدون ردیابی',
            description: 'تبلیغات شبکه‌ای فقط با رضایت شما فعال می‌شوند.',
            icon: IconShield,
            tone: 'bg-[rgb(var(--color-success-rgb)/0.12)] text-[var(--color-success)]',
          },
          {
            title: 'کنترل کامل کاربر',
            description: 'هر زمان می‌توانید رضایت را تغییر دهید یا حذف کنید.',
            icon: IconHeart,
            tone: 'bg-[rgb(var(--color-danger-rgb)/0.12)] text-[var(--color-danger)]',
          },
          {
            title: 'شفافیت داده‌ها',
            description: 'فقط داده‌های تجمیعی و بدون شناسایی فردی ثبت می‌شود.',
            icon: IconZap,
            tone: 'bg-[rgb(var(--color-info-rgb)/0.12)] text-[var(--color-info)]',
          },
        ].map((item) => (
          <Card key={item.title} className="p-5 md:p-6">
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${item.tone}`}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--text-primary)]">{item.title}</div>
                <div className="text-sm text-[var(--text-muted)] leading-6">{item.description}</div>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-black text-[var(--text-primary)]">تنظیمات رضایت</h2>
          <Button type="button" variant="tertiary" size="sm" onClick={resetConsent}>
            بازنشانی تنظیمات
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-5 md:p-6 space-y-4">
            <div>
              <div className="text-sm font-bold text-[var(--text-primary)]">تبلیغات زمینه‌ای</div>
              <p className="text-sm text-[var(--text-muted)] leading-6">
                تبلیغات بر اساس محتوای همین صفحه نمایش داده می‌شوند و نیاز به ردیابی شما ندارند.
              </p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-[var(--text-muted)]">
                وضعیت: {contextualEnabled ? 'فعال' : 'غیرفعال'}
              </span>
              <Button
                type="button"
                size="sm"
                variant={contextualEnabled ? 'primary' : 'secondary'}
                onClick={() => updateConsent({ contextualAds: !contextualEnabled })}
              >
                {contextualEnabled ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
              </Button>
            </div>
          </Card>

          <Card className="p-5 md:p-6 space-y-4">
            <div>
              <div className="text-sm font-bold text-[var(--text-primary)]">تبلیغات هدفمند</div>
              <p className="text-sm text-[var(--text-muted)] leading-6">
                تبلیغات بر اساس ترجیحات شما نمایش داده می‌شوند و نیاز به رضایت جداگانه دارند.
              </p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-[var(--text-muted)]">
                وضعیت: {targetedEnabled ? 'فعال' : 'غیرفعال'}
              </span>
              <Button
                type="button"
                size="sm"
                variant={targetedEnabled ? 'primary' : 'secondary'}
                onClick={() => updateConsent({ targetedAds: !targetedEnabled })}
                disabled={!canToggleTargeted}
              >
                {targetedEnabled ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
              </Button>
            </div>
            {!canToggleTargeted && (
              <p className="text-xs text-[var(--text-muted)]">
                برای فعال‌سازی تبلیغات هدفمند، ابتدا تبلیغات زمینه‌ای را فعال کنید.
              </p>
            )}
          </Card>
        </div>

        <Card className="p-5 md:p-6 space-y-2 text-sm text-[var(--text-muted)]">
          <div>
            آخرین بروزرسانی:{' '}
            <span className="font-semibold text-[var(--text-primary)]">
              {consent?.updatedAt ? formatDate(consent.updatedAt) : 'ثبت نشده'}
            </span>
          </div>
          <div>
            وضعیت ذخیره‌سازی: <span className="font-semibold text-[var(--text-primary)]">محلی</span>
          </div>
        </Card>
      </section>

      <Card className="p-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-lg font-black text-[var(--text-primary)]">اعلامیه شفافیت درآمدی</div>
          <Button type="button" size="sm" variant="secondary" onClick={downloadPeriodicReport}>
            دانلود گزارش ۳۰ روزه
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            نمایش کل:{' '}
            <span className="font-bold text-[var(--text-primary)]">{reportSummary.views}</span>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            کلیک کل:{' '}
            <span className="font-bold text-[var(--text-primary)]">{reportSummary.clicks}</span>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            CTR: <span className="font-bold text-[var(--text-primary)]">{reportSummary.ctr}%</span>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            اسلات فعال در گزارش:{' '}
            <span className="font-bold text-[var(--text-primary)]">{reportSummary.slots}</span>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            تنوع نسخه‌ها:{' '}
            <span className="font-bold text-[var(--text-primary)]">{reportSummary.variants}</span>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            KPI تجربه کاربر (نرخ پذیرش):{' '}
            <span className="font-bold text-[var(--text-primary)]">
              {reportSummary.acceptanceRate}%
            </span>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            KPI درآمد (بهترین نسخه):{' '}
            <span className="font-bold text-[var(--text-primary)]">{reportSummary.topVariant}</span>
          </div>
        </div>
        <div className="text-lg font-black text-[var(--text-primary)]">
          چه داده‌هایی جمع نمی‌شود؟
        </div>
        <ul className="space-y-2 text-sm text-[var(--text-muted)]">
          <li>فایل‌های آپلود شده یا محتوای آن‌ها</li>
          <li>شناسه‌های شخصی یا اطلاعات پرداخت</li>
          <li>تاریخچه کامل مرور شما در سایت‌های دیگر</li>
          <li>پارامترهای query/hash مسیرها در گزارش تجمیعی ذخیره نمی‌شوند</li>
        </ul>
      </Card>

      <section className="space-y-4" aria-labelledby="ads-demo-slot-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="ads-demo-slot-heading" className="text-xl font-black text-[var(--text-primary)]">
            نمونه تبلیغ استاتیک محلی
          </h2>
          <Button type="button" variant="secondary" size="sm" onClick={refreshStats}>
            بروزرسانی آمار
          </Button>
        </div>

        <Card className="p-5 md:p-6 space-y-4">
          <p className="text-sm text-[var(--text-muted)] leading-6">
            این بنر از مسیر محلی `public/ads` بارگذاری می‌شود و فقط پس از رضایت تبلیغات نمایش داده
            خواهد شد.
          </p>
          <AdContainer className="my-0 justify-start">
            <StaticAdSlot
              slotId="ads-transparency-demo-slot"
              campaignId="local-sponsor-2026-q1"
              imageUrl="/ads/local-sponsor-banner-a.svg"
              alt="بنر نمونه اسپانسر محلی"
              href="/support"
              width={728}
              height={90}
              experiment={{
                key: 'ads-transparency-demo-slot-layout-2026-q1',
                control: {
                  campaignId: 'local-sponsor-2026-q1-a',
                  imageUrl: '/ads/local-sponsor-banner-a.svg',
                  alt: 'بنر نمونه اسپانسر محلی - نسخه A',
                  href: '/support',
                  label: 'A',
                },
                challenger: {
                  campaignId: 'local-sponsor-2026-q1-b',
                  imageUrl: '/ads/local-sponsor-banner-b.svg',
                  alt: 'بنر نمونه اسپانسر محلی - نسخه B',
                  href: '/support?ref=ad-variant-b',
                  label: 'B',
                },
              }}
            />
          </AdContainer>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              نمایش در ۳۰ روز اخیر:{' '}
              <span className="font-bold text-[var(--text-primary)]">{slotStats.views}</span>
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              کلیک در ۳۰ روز اخیر:{' '}
              <span className="font-bold text-[var(--text-primary)]">{slotStats.clicks}</span>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
