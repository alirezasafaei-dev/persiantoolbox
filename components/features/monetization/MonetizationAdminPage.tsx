'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import Input from '@/shared/ui/Input';
import StatCard from '@/shared/ui/StatCard';
import Tabs from '@/shared/ui/Tabs';
import DataTable from '@/shared/ui/DataTable';
import BarChart from '@/shared/ui/charts/BarChart';
import LineChart from '@/shared/ui/charts/LineChart';
import PieChart from '@/shared/ui/charts/PieChart';
import ProgressBar from '@/shared/ui/ProgressBar';
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
import { SUBSCRIPTION_PLANS } from '@/lib/subscriptionPlans';
import {
  hasFormErrors,
  validateCampaignDraft,
  validateSlotDraft,
  type CampaignFormErrors,
  type SlotFormErrors,
} from './formValidation';
import {
  loadCoupons,
  saveCoupons,
  loadSubscriptions,
  saveSubscriptions,
  loadPayments,
  savePayments,
  generateId,
  seedDemoData,
  type Coupon,
  type AdminSubscription,
  type Payment,
} from './monetizationAdminData';

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

const formatCurrency = (value: number) => `${new Intl.NumberFormat('fa-IR').format(value)} تومان`;

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

  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  const [couponCode, setCouponCode] = useState('');
  const [couponPercent, setCouponPercent] = useState('10');
  const [couponMaxUses, setCouponMaxUses] = useState('100');
  const [couponExpiresDays, setCouponExpiresDays] = useState('30');
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    setStore(getMonetizationStore());
    setAdReport(getAdPerformanceReport(30));
    const storedSubs = loadSubscriptions();
    const storedPayments = loadPayments();
    const seeded = seedDemoData(storedSubs, storedPayments);
    setSubscriptions(seeded.subs);
    setPayments(seeded.payments);
    if (storedSubs.length === 0) {
      saveSubscriptions(seeded.subs);
    }
    if (storedPayments.length === 0) {
      savePayments(seeded.payments);
    }
    setCoupons(loadCoupons());
  }, []);

  const orderedSlots = useMemo(() => store.slots.slice(), [store.slots]);
  const orderedCampaigns = useMemo(() => store.campaigns.slice(), [store.campaigns]);

  const revenueStats = useMemo(() => {
    const totalRevenue = payments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    const activeSubs = subscriptions.filter((s) => s.status === 'active');
    const canceledSubs = subscriptions.filter((s) => s.status === 'canceled');
    const expiredSubs = subscriptions.filter((s) => s.status === 'expired');
    const monthlyRevenue = activeSubs
      .filter((s) => s.planId.includes('monthly'))
      .reduce((sum, s) => sum + s.amount, 0);
    const yearlyRevenue = activeSubs
      .filter((s) => s.planId.includes('yearly'))
      .reduce((sum, s) => sum + Math.round(s.amount / 12), 0);
    const mrr = monthlyRevenue + yearlyRevenue;
    const churnRate =
      subscriptions.length > 0 ? Math.round((canceledSubs.length / subscriptions.length) * 100) : 0;
    return {
      totalRevenue,
      mrr,
      churnRate,
      activeSubs: activeSubs.length,
      canceledSubs: canceledSubs.length,
      expiredSubs: expiredSubs.length,
    };
  }, [payments, subscriptions]);

  const subscriptionTimeline = useMemo(() => {
    const now = Date.now();
    const MONTH = 86400000 * 30;
    const months = Array.from({ length: 6 }, (_, i) => {
      const monthStart = now - (5 - i) * MONTH;
      const monthEnd = monthStart + MONTH;
      const monthLabel = new Intl.DateTimeFormat('fa-IR', { month: 'short' }).format(
        new Date(monthStart),
      );
      const active = subscriptions.filter(
        (s) => s.startedAt <= monthEnd && s.expiresAt > monthStart && s.status === 'active',
      ).length;
      const canceled = subscriptions.filter(
        (s) => s.status === 'canceled' && s.startedAt <= monthEnd,
      ).length;
      const expired = subscriptions.filter(
        (s) => s.status === 'expired' && s.expiresAt > monthStart && s.expiresAt <= monthEnd,
      ).length;
      return { label: monthLabel, active, canceled, expired };
    });
    return months;
  }, [subscriptions]);

  const planPopularity = useMemo(() => {
    return SUBSCRIPTION_PLANS.map((plan) => {
      const count = subscriptions.filter((s) => s.planId === plan.id).length;
      return { label: plan.title, value: count, planId: plan.id };
    }).sort((a, b) => b.value - a.value);
  }, [subscriptions]);

  const revenueForecast = useMemo(() => {
    const now = Date.now();
    const MONTH = 86400000 * 30;
    const currentMRR = revenueStats.mrr;
    const growthRate = subscriptions.length > 5 ? 0.05 : 0.1;
    return Array.from({ length: 6 }, (_, i) => {
      const monthOffset = i + 1;
      const forecastedMRR = Math.round(currentMRR * Math.pow(1 + growthRate, monthOffset));
      const monthLabel = new Intl.DateTimeFormat('fa-IR', { month: 'short' }).format(
        new Date(now + monthOffset * MONTH),
      );
      return { label: monthLabel, current: currentMRR, forecasted: forecastedMRR };
    });
  }, [revenueStats.mrr, subscriptions.length]);

  const paymentStatusData = useMemo(() => {
    const completed = payments.filter((p) => p.status === 'completed').length;
    const pending = payments.filter((p) => p.status === 'pending').length;
    const failed = payments.filter((p) => p.status === 'failed').length;
    return [
      { label: 'تکمیل شده', value: completed, color: 'var(--color-success)' },
      { label: 'در انتظار', value: pending, color: 'var(--color-warning)' },
      { label: 'ناموفق', value: failed, color: 'var(--color-danger)' },
    ];
  }, [payments]);

  const recentPayments = useMemo(
    () => [...payments].sort((a, b) => b.createdAt - a.createdAt).slice(0, 20),
    [payments],
  );

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

  const handleSaveCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponFeedback('کد کوپن الزامی است.');
      return;
    }
    const percent = parseInt(couponPercent, 10);
    if (isNaN(percent) || percent < 1 || percent > 100) {
      setCouponFeedback('درصد تخفیف باید بین ۱ تا ۱۰۰ باشد.');
      return;
    }
    const maxUses = parseInt(couponMaxUses, 10);
    if (isNaN(maxUses) || maxUses < 1) {
      setCouponFeedback('حداکثر استفاده باید حداقل ۱ باشد.');
      return;
    }
    const expiresDays = parseInt(couponExpiresDays, 10);
    if (isNaN(expiresDays) || expiresDays < 1) {
      setCouponFeedback('تاریخ انقضا باید حداقل ۱ روز باشد.');
      return;
    }

    if (editingCoupon) {
      const updated = coupons.map((c) =>
        c.id === editingCoupon.id
          ? { ...c, code, percent, maxUses, expiresAt: Date.now() + expiresDays * 86400000 }
          : c,
      );
      setCoupons(updated);
      saveCoupons(updated);
      setEditingCoupon(null);
      setCouponFeedback('کوپن با موفقیت ویرایش شد.');
    } else {
      const duplicate = coupons.some((c) => c.code === code);
      if (duplicate) {
        setCouponFeedback('کد کوپن تکراری است.');
        return;
      }
      const newCoupon: Coupon = {
        id: generateId(),
        code,
        percent,
        maxUses,
        usedCount: 0,
        expiresAt: Date.now() + expiresDays * 86400000,
        createdAt: Date.now(),
        active: true,
      };
      const next = [...coupons, newCoupon];
      setCoupons(next);
      saveCoupons(next);
      setCouponFeedback('کوپن با موفقیت اضافه شد.');
    }
    setCouponCode('');
    setCouponPercent('10');
    setCouponMaxUses('100');
    setCouponExpiresDays('30');
  };

  const handleDeleteCoupon = (id: string) => {
    const next = coupons.filter((c) => c.id !== id);
    setCoupons(next);
    saveCoupons(next);
  };

  const handleToggleCoupon = (coupon: Coupon) => {
    const next = coupons.map((c) => (c.id === coupon.id ? { ...c, active: !c.active } : c));
    setCoupons(next);
    saveCoupons(next);
  };

  const startEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCouponCode(coupon.code);
    setCouponPercent(String(coupon.percent));
    setCouponMaxUses(String(coupon.maxUses));
    const daysLeft = Math.max(1, Math.ceil((coupon.expiresAt - Date.now()) / 86400000));
    setCouponExpiresDays(String(daysLeft));
    setCouponFeedback(null);
  };

  const summaryEntries = Object.entries(summary.eventCounts).sort((a, b) => b[1] - a[1]);
  const topPaths = Object.entries(summary.pathCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const tabs = useMemo(
    () => [
      {
        id: 'revenue',
        label: 'داشبورد درآمد',
        content: (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="کل درآمد"
                value={formatCurrency(revenueStats.totalRevenue)}
                icon={<span>💰</span>}
              />
              <StatCard
                title="درآمد ماهانه تکراری (MRR)"
                value={formatCurrency(revenueStats.mrr)}
                icon={<span>📈</span>}
                change={{ value: 5, type: 'up' }}
              />
              <StatCard
                title="نرخ ریزش"
                value={`${revenueStats.churnRate}%`}
                icon={<span>📊</span>}
                change={{
                  value: revenueStats.churnRate,
                  type: revenueStats.churnRate > 10 ? 'down' : 'up',
                }}
              />
              <StatCard
                title="اشتراک‌های فعال"
                value={revenueStats.activeSubs}
                icon={<span>👥</span>}
              />
            </div>

            <Card className="p-6">
              <div className="mb-4 text-lg font-bold text-[var(--text-primary)]">
                پیش‌بینی درآمد ۶ ماه آینده
              </div>
              <LineChart
                data={revenueForecast.map((r) => ({ label: r.label, value: r.forecasted }))}
                height={160}
                color="var(--color-primary)"
              />
              <div className="mt-3 grid grid-cols-3 gap-4 text-xs text-[var(--text-muted)]">
                <div>
                  <span className="block font-semibold text-[var(--text-primary)]">
                    نرخ رشد فرضی
                  </span>
                  ۵٪ ماهانه
                </div>
                <div>
                  <span className="block font-semibold text-[var(--text-primary)]">MRR فعلی</span>
                  {formatCurrency(revenueStats.mrr)}
                </div>
                <div>
                  <span className="block font-semibold text-[var(--text-primary)]">
                    MRR پیش‌بینی‌شده
                  </span>
                  {formatCurrency(revenueForecast[5]?.forecasted ?? 0)}
                </div>
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-6">
                <div className="mb-4 text-lg font-bold text-[var(--text-primary)]">
                  گزارش تبلیغات ۳۰ روزه
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">نمایش</span>
                    <span className="text-[var(--text-primary)]">{adReport.totals.views}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">کلیک</span>
                    <span className="text-[var(--text-primary)]">{adReport.totals.clicks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">CTR</span>
                    <span className="text-[var(--text-primary)]">{adReport.totals.ctr}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">نسخه‌های فعال A/B</span>
                    <span className="text-[var(--text-primary)]">{adReport.totals.variants}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">نرخ پذیرش رضایت</span>
                    <span className="text-[var(--text-primary)]">
                      {adReport.kpis.ux.consentAcceptanceRate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">بهترین نسخه</span>
                    <span className="text-[var(--text-primary)]">
                      {adReport.kpis.revenue.topVariantId ?? 'ندارد'}
                    </span>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="mb-4 text-lg font-bold text-[var(--text-primary)]">
                  رویدادهای برتر
                </div>
                <div className="space-y-1 text-sm">
                  {summaryEntries.length === 0 && (
                    <div className="text-[var(--text-muted)]">هنوز داده‌ای ثبت نشده</div>
                  )}
                  {summaryEntries.slice(0, 5).map(([event, count]) => (
                    <div key={event} className="flex items-center justify-between">
                      <span className="text-[var(--text-primary)]">{event}</span>
                      <span className="text-[var(--text-muted)]">{count}</span>
                    </div>
                  ))}
                </div>
                {topPaths.length > 0 && (
                  <>
                    <div className="mt-4 mb-2 text-sm font-bold text-[var(--text-primary)]">
                      مسیرهای پرتکرار
                    </div>
                    <div className="space-y-1 text-sm">
                      {topPaths.map(([path, count]) => (
                        <div key={path} className="flex items-center justify-between">
                          <span className="text-[var(--text-primary)]">{path}</span>
                          <span className="text-[var(--text-muted)]">{count}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Card>
            </div>
          </div>
        ),
      },
      {
        id: 'subscriptions',
        label: 'تحلیل اشتراک‌ها',
        content: (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                title="اشتراک‌های فعال"
                value={revenueStats.activeSubs}
                icon={<span>✅</span>}
              />
              <StatCard title="لغو شده" value={revenueStats.canceledSubs} icon={<span>❌</span>} />
              <StatCard title="منقضی شده" value={revenueStats.expiredSubs} icon={<span>⏰</span>} />
            </div>

            <Card className="p-6">
              <div className="mb-4 text-lg font-bold text-[var(--text-primary)]">
                روند اشتراک‌ها در ۶ ماه اخیر
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <div className="mb-2 text-xs text-[var(--text-muted)]">
                    اشتراک‌های فعال در طول زمان
                  </div>
                  <LineChart
                    data={subscriptionTimeline.map((t) => ({ label: t.label, value: t.active }))}
                    height={140}
                    color="var(--color-success)"
                  />
                </div>
                <div>
                  <div className="mb-2 text-xs text-[var(--text-muted)]">
                    لغو و انقضا در طول زمان
                  </div>
                  <BarChart
                    data={subscriptionTimeline.map((t) => ({
                      label: t.label,
                      value: t.canceled + t.expired,
                    }))}
                    height={140}
                    color="var(--color-danger)"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-4 text-lg font-bold text-[var(--text-primary)]">
                وضعیت اشتراک‌ها
              </div>
              <PieChart
                data={paymentStatusData.map((d) => ({
                  label: d.label,
                  value: d.value,
                  color: d.color,
                }))}
                size={140}
              />
            </Card>
          </div>
        ),
      },
      {
        id: 'plans',
        label: 'مقایسه پلن‌ها',
        content: (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="mb-4 text-lg font-bold text-[var(--text-primary)]">
                محبوبیت پلن‌ها
              </div>
              <BarChart
                data={planPopularity.map((p) => ({ label: p.label, value: p.value }))}
                height={180}
                color="var(--color-primary)"
              />
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {planPopularity.map((plan) => {
                const planData = SUBSCRIPTION_PLANS.find((p) => p.id === plan.planId);
                const percentage =
                  subscriptions.length > 0
                    ? Math.round((plan.value / subscriptions.length) * 100)
                    : 0;
                return (
                  <Card key={plan.planId} className="p-5 space-y-3">
                    <div className="text-sm font-bold text-[var(--text-primary)]">
                      {planData?.title ?? plan.planId}
                    </div>
                    <div className="text-xl font-black text-[var(--color-primary)]">
                      {formatCurrency(planData?.price ?? 0)}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      دوره: {planData?.periodDays} روز
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      تعداد اشتراک: {plan.value} ({percentage}%)
                    </div>
                    <ProgressBar value={percentage} label={`محبوبیت ${planData?.title}`} />
                  </Card>
                );
              })}
            </div>
          </div>
        ),
      },
      {
        id: 'payments',
        label: 'تاریخچه پرداخت‌ها',
        content: (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                title="پرداخت‌های تکمیل شده"
                value={payments.filter((p) => p.status === 'completed').length}
                icon={<span>✅</span>}
              />
              <StatCard
                title="پرداخت‌های در انتظار"
                value={payments.filter((p) => p.status === 'pending').length}
                icon={<span>⏳</span>}
              />
              <StatCard
                title="پرداخت‌های ناموفق"
                value={payments.filter((p) => p.status === 'failed').length}
                icon={<span>❌</span>}
              />
            </div>

            <Card className="p-6">
              <div className="mb-4 text-lg font-bold text-[var(--text-primary)]">
                آخرین پرداخت‌ها
              </div>
              <DataTable
                columns={[
                  { key: 'userId', header: 'کاربر', sortable: true },
                  {
                    key: 'planId',
                    header: 'پلن',
                    render: (row) =>
                      SUBSCRIPTION_PLANS.find((p) => p.id === (row as Payment).planId)?.title ??
                      (row as Payment).planId,
                  },
                  {
                    key: 'amount',
                    header: 'مبلغ',
                    render: (row) => formatCurrency((row as Payment).amount),
                    sortable: true,
                  },
                  {
                    key: 'status',
                    header: 'وضعیت',
                    render: (row) => {
                      const s = (row as Payment).status;
                      const color =
                        s === 'completed'
                          ? 'var(--color-success)'
                          : s === 'pending'
                            ? 'var(--color-warning)'
                            : 'var(--color-danger)';
                      const label =
                        s === 'completed' ? 'تکمیل' : s === 'pending' ? 'در انتظار' : 'ناموفق';
                      return <span style={{ color }}>{label}</span>;
                    },
                  },
                  {
                    key: 'createdAt',
                    header: 'تاریخ',
                    render: (row) => formatDate((row as Payment).createdAt),
                    sortable: true,
                  },
                  {
                    key: 'couponCode',
                    header: 'کوپن',
                    render: (row) => (row as Payment).couponCode ?? '—',
                  },
                ]}
                data={recentPayments.map((p) => ({ ...p }))}
                pageSize={10}
                emptyMessage="هنوز پرداختی ثبت نشده"
                searchable
                searchPlaceholder="جستجوی کاربر..."
              />
            </Card>
          </div>
        ),
      },
      {
        id: 'coupons',
        label: 'مدیریت کوپن‌ها',
        content: (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard title="کل کوپن‌ها" value={coupons.length} icon={<span>🎟️</span>} />
              <StatCard
                title="کوپن‌های فعال"
                value={coupons.filter((c) => c.active).length}
                icon={<span>✅</span>}
              />
              <StatCard
                title="مجموع استفاده"
                value={coupons.reduce((s, c) => s + c.usedCount, 0)}
                icon={<span>📊</span>}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <Card className="p-6 space-y-4">
                <div className="text-lg font-bold text-[var(--text-primary)]">
                  {editingCoupon ? 'ویرایش کوپن' : 'افزودن کوپن جدید'}
                </div>
                <Input
                  label="کد کوپن"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponFeedback(null);
                  }}
                  placeholder="مثلاً NOWRUZ"
                />
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="درصد تخفیف"
                    type="number"
                    value={couponPercent}
                    onChange={(e) => {
                      setCouponPercent(e.target.value);
                      setCouponFeedback(null);
                    }}
                    placeholder="10"
                  />
                  <Input
                    label="حداکثر استفاده"
                    type="number"
                    value={couponMaxUses}
                    onChange={(e) => {
                      setCouponMaxUses(e.target.value);
                      setCouponFeedback(null);
                    }}
                    placeholder="100"
                  />
                  <Input
                    label="روزهای انقضا"
                    type="number"
                    value={couponExpiresDays}
                    onChange={(e) => {
                      setCouponExpiresDays(e.target.value);
                      setCouponFeedback(null);
                    }}
                    placeholder="30"
                  />
                </div>
                {couponFeedback ? (
                  <p
                    className={`text-sm font-semibold rtl-fix ${couponFeedback.includes('موفقیت') ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}
                    role="status"
                  >
                    {couponFeedback}
                  </p>
                ) : null}
                <div className="flex gap-2">
                  <Button type="button" onClick={handleSaveCoupon}>
                    {editingCoupon ? 'ذخیره تغییرات' : 'افزودن کوپن'}
                  </Button>
                  {editingCoupon ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setEditingCoupon(null);
                        setCouponCode('');
                        setCouponPercent('10');
                        setCouponMaxUses('100');
                        setCouponExpiresDays('30');
                        setCouponFeedback(null);
                      }}
                    >
                      انصراف
                    </Button>
                  ) : null}
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <div className="text-lg font-bold text-[var(--text-primary)]">لیست کوپن‌ها</div>
                {coupons.length === 0 && (
                  <div className="text-sm text-[var(--text-muted)]">هنوز کوپنی ثبت نشده است.</div>
                )}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {coupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-[var(--color-primary)] font-mono">
                          {coupon.code}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-semibold ${coupon.active ? 'text-[var(--color-success)]' : 'text-[var(--text-muted)]'}`}
                          >
                            {coupon.active ? 'فعال' : 'غیرفعال'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-[var(--text-muted)]">
                        {coupon.percent}% تخفیف · {coupon.usedCount}/{coupon.maxUses} استفاده ·
                        انقضا: {formatDate(coupon.expiresAt)}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => startEditCoupon(coupon)}
                        >
                          ویرایش
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => handleToggleCoupon(coupon)}
                        >
                          {coupon.active ? 'غیرفعال' : 'فعال'}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="tertiary"
                          onClick={() => handleDeleteCoupon(coupon.id)}
                        >
                          حذف
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        ),
      },
      {
        id: 'ads',
        label: 'اسلات‌ها و کمپین‌ها',
        content: (
          <div className="space-y-8">
            <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <Card className="p-6 space-y-4">
                <div className="text-lg font-black text-[var(--text-primary)]">
                  افزودن اسلات تبلیغ
                </div>
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
                    {slotErrors.placement ? (
                      <p className="text-sm text-[var(--color-danger)] rtl-fix">
                        {slotErrors.placement}
                      </p>
                    ) : null}
                  </label>
                </div>
                {slotFeedback ? (
                  <p
                    className="text-sm font-semibold text-[var(--color-success)] rtl-fix"
                    role="status"
                  >
                    {slotFeedback}
                  </p>
                ) : null}
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
                        setCampaignSlotId(
                          event.target.value.length > 0 ? event.target.value : null,
                        );
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
                    {campaignErrors.slotId ? (
                      <p className="text-sm text-[var(--color-danger)] rtl-fix">
                        {campaignErrors.slotId}
                      </p>
                    ) : null}
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
                    {campaignErrors.status ? (
                      <p className="text-sm text-[var(--color-danger)] rtl-fix">
                        {campaignErrors.status}
                      </p>
                    ) : null}
                  </label>
                </div>
                {campaignFeedback ? (
                  <p
                    className="text-sm font-semibold text-[var(--color-success)] rtl-fix"
                    role="status"
                  >
                    {campaignFeedback}
                  </p>
                ) : null}
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
                        <div className="font-semibold text-[var(--text-primary)]">
                          {campaign.name}
                        </div>
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
        ),
      },
    ],
    [
      revenueStats,
      adReport,
      summaryEntries,
      topPaths,
      subscriptionTimeline,
      planPopularity,
      payments,
      recentPayments,
      paymentStatusData,
      revenueForecast,
      subscriptions,
      coupons,
      couponCode,
      couponPercent,
      couponMaxUses,
      couponExpiresDays,
      couponFeedback,
      editingCoupon,
      orderedSlots,
      orderedCampaigns,
      slotName,
      slotPlacement,
      slotSize,
      slotErrors,
      slotFeedback,
      campaignName,
      campaignSponsor,
      campaignTargetUrl,
      campaignAssetUrl,
      campaignSlotId,
      campaignStatus,
      campaignErrors,
      campaignFeedback,
      handleSaveCoupon,
      handleDeleteCoupon,
      handleToggleCoupon,
      startEditCoupon,
      handleAddSlot,
      handleAddCampaign,
      toggleSlot,
      toggleCampaign,
      clearSlotError,
      clearCampaignError,
    ],
  );

  return (
    <div className="space-y-10">
      <section className="section-surface p-6 md:p-8">
        <div className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
            پنل درآمدزایی
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)]">
            مدیریت درآمد و تبلیغات
          </h1>
          <p className="text-[var(--text-secondary)] leading-7">
            داشبورد جامع درآمد، تحلیل اشتراک‌ها، مدیریت کوپن‌ها و تنظیمات تبلیغات.
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

      <Tabs tabs={tabs} defaultTab="revenue" />
    </div>
  );
}
