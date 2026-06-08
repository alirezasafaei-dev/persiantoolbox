'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import Input from '@/shared/ui/Input';
import {
  addAdSlot,
  addCampaign,
  getMonetizationStore,
  removeAdSlot,
  removeCampaign,
  updateAdSlot,
  updateCampaign,
  type AdCampaign,
  type AdSlot,
} from '@/shared/monetization/monetizationStore';
import type { AnalyticsSummary } from '@/lib/analyticsStore';
import { getAdPerformanceReport } from '@/shared/analytics/ads';
import {
  hasFormErrors,
  validateCampaignDraft,
  validateSlotDraft,
  type CampaignFormErrors,
  type SlotFormErrors,
} from './formValidation';

const placements = [
  { value: 'header', label: 'هدر' },
  { value: 'sidebar', label: 'سایدبار' },
  { value: 'inline', label: 'درون محتوا' },
  { value: 'footer', label: 'فوتر' },
];

const statuses: Array<AdCampaign['status']> = ['active', 'paused'];

const formatDate = (value: number) =>
  new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

type MonetizationAdminPageProps = {
  initialSummary: AnalyticsSummary;
};

export default function MonetizationAdminPage({ initialSummary }: MonetizationAdminPageProps) {
  const [store, setStore] = useState(() => getMonetizationStore());
  const [summary] = useState<AnalyticsSummary>(initialSummary);
  const [adReport, setAdReport] = useState(() => getAdPerformanceReport(30));

  const [slotName, setSlotName] = useState('');
  const [slotPlacement, setSlotPlacement] = useState(placements[0]?.value ?? 'inline');
  const [slotSize, setSlotSize] = useState('728x90');

  const [campaignName, setCampaignName] = useState('');
  const [campaignSponsor, setCampaignSponsor] = useState('');
  const [campaignTargetUrl, setCampaignTargetUrl] = useState('');
  const [campaignAssetUrl, setCampaignAssetUrl] = useState('');
  const [campaignSlotId, setCampaignSlotId] = useState<string | null>(null);
  const [campaignStatus, setCampaignStatus] = useState<AdCampaign['status']>('active');
  const [slotErrors, setSlotErrors] = useState<SlotFormErrors>({});
  const [campaignErrors, setCampaignErrors] = useState<CampaignFormErrors>({});
  const [slotFeedback, setSlotFeedback] = useState<string | null>(null);
  const [campaignFeedback, setCampaignFeedback] = useState<string | null>(null);

  useEffect(() => {
    setStore(getMonetizationStore());
    setAdReport(getAdPerformanceReport(30));
  }, []);

  const orderedSlots = useMemo(() => store.slots.slice(), [store.slots]);
  const orderedCampaigns = useMemo(() => store.campaigns.slice(), [store.campaigns]);

  const clearSlotError = (key: keyof SlotFormErrors) => {
    setSlotErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const clearCampaignError = (key: keyof CampaignFormErrors) => {
    setCampaignErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const handleAddSlot = () => {
    const errors = validateSlotDraft(
      { name: slotName, placement: slotPlacement, size: slotSize },
      orderedSlots,
    );
    setSlotErrors(errors);
    setSlotFeedback(null);
    if (hasFormErrors(errors)) {
      return;
    }

    const next = addAdSlot({
      name: slotName.trim(),
      placement: slotPlacement,
      size: slotSize.trim() || 'auto',
      active: true,
    });
    setStore(next);
    setSlotName('');
    setSlotErrors({});
    setSlotFeedback('اسلات با موفقیت اضافه شد.');
  };

  const handleAddCampaign = () => {
    const errors = validateCampaignDraft(
      {
        name: campaignName,
        targetUrl: campaignTargetUrl,
        assetUrl: campaignAssetUrl,
        slotId: campaignSlotId,
        status: campaignStatus,
      },
      orderedSlots,
      orderedCampaigns,
    );
    setCampaignErrors(errors);
    setCampaignFeedback(null);
    if (hasFormErrors(errors)) {
      return;
    }

    const next = addCampaign({
      name: campaignName.trim(),
      sponsor: campaignSponsor.trim() || 'نامشخص',
      targetUrl: campaignTargetUrl.trim(),
      assetUrl: campaignAssetUrl.trim(),
      slotId: campaignSlotId,
      status: campaignStatus,
    });
    setStore(next);
    setCampaignName('');
    setCampaignSponsor('');
    setCampaignTargetUrl('');
    setCampaignAssetUrl('');
    setCampaignErrors({});
    setCampaignFeedback('کمپین با موفقیت اضافه شد.');
  };

  const toggleSlot = (slot: AdSlot) => {
    const next = updateAdSlot(slot.id, { active: !slot.active });
    setStore(next);
  };

  const toggleCampaign = (campaign: AdCampaign) => {
    const next = updateCampaign(campaign.id, {
      status: campaign.status === 'active' ? 'paused' : 'active',
    });
    setStore(next);
  };

  const summaryEntries = Object.entries(summary.eventCounts).sort((a, b) => b[1] - a[1]);
  const topPaths = Object.entries(summary.pathCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-10">
      <section className="section-surface p-6 md:p-8">
        <div className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]"></span>
            پنل درآمدزایی (MVP)
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)]">
            مدیریت اسلات‌های تبلیغ و کمپین‌ها
          </h1>
          <p className="text-[var(--text-secondary)] leading-7">
            این پنل به صورت محلی کار می‌کند و اطلاعات در مرورگر ذخیره می‌شود. برای محیط عملیاتی،
            نسخه امن و مبتنی بر سرور توسعه داده خواهد شد.
          </p>
          <div>
            <Link
              href="/admin/site-settings"
              className="inline-flex items-center rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
            >
              مدیریت تنظیمات معرفی توسعه‌دهنده
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-5 space-y-2">
          <div className="text-sm text-[var(--text-muted)]">کل رویدادها</div>
          <div className="text-2xl font-black text-[var(--text-primary)]">
            {summary.totalEvents}
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            آخرین بروزرسانی: {summary.lastUpdated ? formatDate(summary.lastUpdated) : 'ثبت نشده'}
          </div>
        </Card>
        <Card className="p-5 space-y-2">
          <div className="text-sm text-[var(--text-muted)]">رویدادهای برتر</div>
          <div className="space-y-1 text-xs text-[var(--text-primary)]">
            {summaryEntries.length === 0 && 'هنوز داده‌ای ثبت نشده'}
            {summaryEntries.slice(0, 3).map(([event, count]) => (
              <div key={event} className="flex items-center justify-between">
                <span>{event}</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5 space-y-2">
          <div className="text-sm text-[var(--text-muted)]">مسیرهای پرتکرار</div>
          <div className="space-y-1 text-xs text-[var(--text-primary)]">
            {topPaths.length === 0 && 'هنوز داده‌ای ثبت نشده'}
            {topPaths.map(([path, count]) => (
              <div key={path} className="flex items-center justify-between">
                <span>{path}</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5 space-y-2">
          <div className="text-sm text-[var(--text-muted)]">گزارش تبلیغات ۳۰ روزه</div>
          <div className="space-y-1 text-xs text-[var(--text-primary)]">
            <div className="flex items-center justify-between">
              <span>نمایش</span>
              <span>{adReport.totals.views}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>کلیک</span>
              <span>{adReport.totals.clicks}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>CTR</span>
              <span>{adReport.totals.ctr}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>نسخه‌های فعال A/B</span>
              <span>{adReport.totals.variants}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>نرخ پذیرش رضایت</span>
              <span>{adReport.kpis.ux.consentAcceptanceRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>بهترین نسخه</span>
              <span>{adReport.kpis.revenue.topVariantId ?? 'ندارد'}</span>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6 space-y-4">
          <div className="text-lg font-black text-[var(--text-primary)]">افزودن اسلات تبلیغ</div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="نام اسلات"
              value={slotName}
              onChange={(event) => {
                setSlotName(event.target.value);
                clearSlotError('name');
                setSlotFeedback(null);
              }}
              placeholder="مثلاً بنر هدر"
              error={slotErrors.name ?? ''}
            />
            <Input
              label="ابعاد"
              value={slotSize}
              onChange={(event) => {
                setSlotSize(event.target.value);
                clearSlotError('size');
                setSlotFeedback(null);
              }}
              placeholder="728x90"
              error={slotErrors.size ?? ''}
              helperText="مثال: 728x90 یا auto"
            />
            <label className="space-y-2 text-sm text-[var(--text-primary)]">
              جایگاه
              <select
                className="input w-full px-4 py-3 bg-[var(--surface-1)] border border-[var(--border-light)] rounded-[var(--radius-md)]"
                value={slotPlacement}
                aria-invalid={slotErrors.placement ? true : undefined}
                onChange={(event) => {
                  setSlotPlacement(event.target.value);
                  clearSlotError('placement');
                  setSlotFeedback(null);
                }}
              >
                {placements.map((placement) => (
                  <option key={placement.value} value={placement.value}>
                    {placement.label}
                  </option>
                ))}
              </select>
              {slotErrors.placement && (
                <p className="text-sm text-[var(--color-danger)] rtl-fix">{slotErrors.placement}</p>
              )}
            </label>
          </div>
          {slotFeedback && (
            <p className="text-sm font-semibold text-[var(--color-success)] rtl-fix" role="status">
              {slotFeedback}
            </p>
          )}
          <Button type="button" onClick={handleAddSlot}>
            افزودن اسلات
          </Button>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="text-lg font-black text-[var(--text-primary)]">لیست اسلات‌ها</div>
          {orderedSlots.length === 0 && (
            <div className="text-sm text-[var(--text-muted)]">هیچ اسلاتی ثبت نشده است.</div>
          )}
          <div className="space-y-3">
            {orderedSlots.map((slot) => (
              <div
                key={slot.id}
                className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-[var(--text-primary)]">{slot.name}</div>
                  <div className="text-xs text-[var(--text-muted)]">{slot.size}</div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                  <span>جایگاه: {slot.placement}</span>
                  <span>وضعیت: {slot.active ? 'فعال' : 'غیرفعال'}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => toggleSlot(slot)}
                  >
                    {slot.active ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="tertiary"
                    onClick={() => setStore(removeAdSlot(slot.id))}
                  >
                    حذف
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6 space-y-4">
          <div className="text-lg font-black text-[var(--text-primary)]">افزودن کمپین</div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="نام کمپین"
              value={campaignName}
              onChange={(event) => {
                setCampaignName(event.target.value);
                clearCampaignError('name');
                setCampaignFeedback(null);
              }}
              placeholder="کمپین زمستان"
              error={campaignErrors.name ?? ''}
            />
            <Input
              label="نام اسپانسر"
              value={campaignSponsor}
              onChange={(event) => setCampaignSponsor(event.target.value)}
              placeholder="برند نمونه"
              helperText="در صورت خالی بودن «نامشخص» ثبت می‌شود."
            />
            <Input
              label="لینک مقصد"
              value={campaignTargetUrl}
              onChange={(event) => {
                setCampaignTargetUrl(event.target.value);
                clearCampaignError('targetUrl');
                setCampaignFeedback(null);
              }}
              placeholder="https://example.com"
              error={campaignErrors.targetUrl ?? ''}
              helperText="مسیر داخلی مثل /pro یا URL معتبر http/https"
            />
            <Input
              label="لینک دارایی تبلیغ"
              value={campaignAssetUrl}
              onChange={(event) => {
                setCampaignAssetUrl(event.target.value);
                clearCampaignError('assetUrl');
                setCampaignFeedback(null);
              }}
              placeholder="https://cdn.example.com/banner.png"
              error={campaignErrors.assetUrl ?? ''}
              helperText="اختیاری؛ مسیر داخلی یا URL معتبر http/https"
            />
            <label className="space-y-2 text-sm text-[var(--text-primary)]">
              اسلات
              <select
                className="input w-full px-4 py-3 bg-[var(--surface-1)] border border-[var(--border-light)] rounded-[var(--radius-md)]"
                aria-invalid={campaignErrors.slotId ? true : undefined}
                value={campaignSlotId ?? ''}
                onChange={(event) => {
                  setCampaignSlotId(event.target.value.length > 0 ? event.target.value : null);
                  clearCampaignError('slotId');
                  setCampaignFeedback(null);
                }}
              >
                <option value="">انتخاب نشده</option>
                {orderedSlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.name}
                  </option>
                ))}
              </select>
              {campaignErrors.slotId && (
                <p className="text-sm text-[var(--color-danger)] rtl-fix">
                  {campaignErrors.slotId}
                </p>
              )}
            </label>
            <label className="space-y-2 text-sm text-[var(--text-primary)]">
              وضعیت
              <select
                className="input w-full px-4 py-3 bg-[var(--surface-1)] border border-[var(--border-light)] rounded-[var(--radius-md)]"
                value={campaignStatus}
                aria-invalid={campaignErrors.status ? true : undefined}
                onChange={(event) => {
                  setCampaignStatus(event.target.value as AdCampaign['status']);
                  clearCampaignError('status');
                  setCampaignFeedback(null);
                }}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === 'active' ? 'فعال' : 'متوقف'}
                  </option>
                ))}
              </select>
              {campaignErrors.status && (
                <p className="text-sm text-[var(--color-danger)] rtl-fix">
                  {campaignErrors.status}
                </p>
              )}
            </label>
          </div>
          {campaignFeedback && (
            <p className="text-sm font-semibold text-[var(--color-success)] rtl-fix" role="status">
              {campaignFeedback}
            </p>
          )}
          <Button type="button" onClick={handleAddCampaign}>
            افزودن کمپین
          </Button>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="text-lg font-black text-[var(--text-primary)]">لیست کمپین‌ها</div>
          {orderedCampaigns.length === 0 && (
            <div className="text-sm text-[var(--text-muted)]">هیچ کمپینی ثبت نشده است.</div>
          )}
          <div className="space-y-3">
            {orderedCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-[var(--text-primary)]">{campaign.name}</div>
                  <div className="text-xs text-[var(--text-muted)]">{campaign.status}</div>
                </div>
                <div className="mt-2 text-xs text-[var(--text-muted)]">
                  اسپانسر: {campaign.sponsor}
                </div>
                <div className="mt-2 text-xs text-[var(--text-muted)]">
                  اسلات:{' '}
                  {orderedSlots.find((slot) => slot.id === campaign.slotId)?.name ?? 'نامشخص'}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => toggleCampaign(campaign)}
                  >
                    {campaign.status === 'active' ? 'توقف' : 'فعال‌سازی'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="tertiary"
                    onClick={() => setStore(removeCampaign(campaign.id))}
                  >
                    حذف
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
