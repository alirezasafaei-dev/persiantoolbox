'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Card } from '@/components/ui';
import Input from '@/shared/ui/Input';
import { CREDIT_PLANS, TOP_UP_PACKS } from '@/lib/pricing/exportCredits';
import type { CreditPlanId } from '@/lib/pricing/exportCredits';
import type { PublicPricingConfig } from '@/lib/pricing/pricingConfig';

type PlanDraft = {
  price: string;
  yearlyPrice: string;
  title: string;
};

type TopUpDraft = {
  price: string;
  credits: string;
  label: string;
};

const EDITABLE_PLAN_IDS: CreditPlanId[] = ['pack-3', 'basic', 'standard', 'pro', 'team'];

function buildPlanDrafts(pricing: PublicPricingConfig): Record<CreditPlanId, PlanDraft> {
  const drafts = {} as Record<CreditPlanId, PlanDraft>;
  for (const planId of EDITABLE_PLAN_IDS) {
    const defaultPlan = CREDIT_PLANS.find((plan) => plan.id === planId)!;
    const resolvedPlan = pricing.plans.find((plan) => plan.id === planId) ?? defaultPlan;
    drafts[planId] = {
      price: String(resolvedPlan.price),
      yearlyPrice: String(pricing.yearlyPrices[planId] ?? defaultPlan.price * 12),
      title: resolvedPlan.title,
    };
  }
  return drafts;
}

function buildTopUpDrafts(pricing: PublicPricingConfig): Record<string, TopUpDraft> {
  const drafts: Record<string, TopUpDraft> = {};
  for (const defaultPack of TOP_UP_PACKS) {
    const resolvedPack = pricing.topUps.find((pack) => pack.id === defaultPack.id) ?? defaultPack;
    drafts[defaultPack.id] = {
      price: String(resolvedPack.price),
      credits: String(resolvedPack.credits),
      label: resolvedPack.label,
    };
  }
  return drafts;
}

export default function PricingAdminSection() {
  const [planDrafts, setPlanDrafts] = useState<Record<CreditPlanId, PlanDraft> | null>(null);
  const [topUpDrafts, setTopUpDrafts] = useState<Record<string, TopUpDraft> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadPricing = useCallback(async () => {
    setLoadError(null);
    try {
      const response = await fetch('/api/admin/pricing', { cache: 'no-store' });
      const payload = (await response.json()) as {
        ok?: boolean;
        pricing?: PublicPricingConfig;
        errors?: string[];
      };
      if (!response.ok || !payload.ok || !payload.pricing) {
        setLoadError(payload.errors?.[0] ?? 'بارگذاری قیمت‌ها با خطا مواجه شد.');
        return;
      }
      setPlanDrafts(buildPlanDrafts(payload.pricing));
      setTopUpDrafts(buildTopUpDrafts(payload.pricing));
    } catch {
      setLoadError('بارگذاری قیمت‌ها با خطا مواجه شد.');
    }
  }, []);

  useEffect(() => {
    void loadPricing();
  }, [loadPricing]);

  const handleSave = async () => {
    if (!planDrafts || !topUpDrafts) {
      return;
    }
    setSaving(true);
    setSaveError(null);
    setFeedback(null);

    const plans: Record<string, { price: number; yearlyPrice?: number; title: string }> = {};
    for (const planId of EDITABLE_PLAN_IDS) {
      const draft = planDrafts[planId];
      plans[planId] = {
        price: Number.parseInt(draft.price, 10),
        title: draft.title.trim(),
      };
      if (planId !== 'pack-3') {
        plans[planId].yearlyPrice = Number.parseInt(draft.yearlyPrice, 10);
      }
    }

    const topUps: Record<string, { price: number; credits: number; label: string }> = {};
    for (const [topUpId, draft] of Object.entries(topUpDrafts)) {
      topUps[topUpId] = {
        price: Number.parseInt(draft.price, 10),
        credits: Number.parseInt(draft.credits, 10),
        label: draft.label.trim(),
      };
    }

    try {
      const response = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plans, topUps }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        pricing?: PublicPricingConfig;
        errors?: string[];
      };
      if (!response.ok || !payload.ok || !payload.pricing) {
        setSaveError(payload.errors?.[0] ?? 'ذخیره قیمت‌ها با خطا مواجه شد.');
        setSaving(false);
        return;
      }
      setPlanDrafts(buildPlanDrafts(payload.pricing));
      setTopUpDrafts(buildTopUpDrafts(payload.pricing));
      setFeedback('قیمت‌ها با موفقیت ذخیره شد.');
      setSaving(false);
    } catch {
      setSaveError('ذخیره قیمت‌ها با خطا مواجه شد.');
      setSaving(false);
    }
  };

  if (loadError) {
    return (
      <Card className="p-6">
        <p className="text-sm text-[var(--color-danger)]">{loadError}</p>
        <Button type="button" className="mt-4" onClick={() => void loadPricing()}>
          تلاش مجدد
        </Button>
      </Card>
    );
  }

  if (!planDrafts || !topUpDrafts) {
    return (
      <Card className="p-6 animate-pulse h-40">
        <div />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <div>
          <h2 className="text-lg font-black text-[var(--text-primary)]">قیمت‌گذاری پلن‌ها</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            تغییرات بلافاصله در صفحه قیمت‌گذاری، مودال ارتقا و درگاه پرداخت اعمال می‌شود.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {EDITABLE_PLAN_IDS.map((planId) => {
            const draft = planDrafts[planId];
            if (!draft) {
              return null;
            }
            const defaultTitle = CREDIT_PLANS.find((plan) => plan.id === planId)?.title ?? planId;
            return (
              <div
                key={planId}
                className="rounded-[var(--radius-md)] border border-[var(--border-light)] p-4 space-y-3"
              >
                <div className="text-sm font-bold text-[var(--text-primary)]">{defaultTitle}</div>
                <Input
                  label="عنوان نمایشی"
                  value={draft.title}
                  onChange={(event) =>
                    setPlanDrafts((current) => {
                      if (!current) {
                        return current;
                      }
                      return {
                        ...current,
                        [planId]: { ...current[planId], title: event.target.value },
                      };
                    })
                  }
                />
                <Input
                  label="قیمت ماهانه (تومان)"
                  value={draft.price}
                  onChange={(event) =>
                    setPlanDrafts((current) => {
                      if (!current) {
                        return current;
                      }
                      return {
                        ...current,
                        [planId]: { ...current[planId], price: event.target.value },
                      };
                    })
                  }
                />
                {planId !== 'pack-3' ? (
                  <Input
                    label="قیمت سالانه (تومان)"
                    value={draft.yearlyPrice}
                    onChange={(event) =>
                      setPlanDrafts((current) => {
                        if (!current) {
                          return current;
                        }
                        return {
                          ...current,
                          [planId]: { ...current[planId], yearlyPrice: event.target.value },
                        };
                      })
                    }
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-black text-[var(--text-primary)]">بسته‌های تکمیلی</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {TOP_UP_PACKS.map((pack) => {
            const draft = topUpDrafts[pack.id];
            if (!draft) {
              return null;
            }
            return (
              <div
                key={pack.id}
                className="rounded-[var(--radius-md)] border border-[var(--border-light)] p-4 space-y-3"
              >
                <Input
                  label="برچسب"
                  value={draft.label}
                  onChange={(event) =>
                    setTopUpDrafts((current) => {
                      if (!current) {
                        return current;
                      }
                      return {
                        ...current,
                        [pack.id]: { ...current[pack.id]!, label: event.target.value },
                      };
                    })
                  }
                />
                <Input
                  label="تعداد اعتبار"
                  value={draft.credits}
                  onChange={(event) =>
                    setTopUpDrafts((current) => {
                      if (!current) {
                        return current;
                      }
                      return {
                        ...current,
                        [pack.id]: { ...current[pack.id]!, credits: event.target.value },
                      };
                    })
                  }
                />
                <Input
                  label="قیمت (تومان)"
                  value={draft.price}
                  onChange={(event) =>
                    setTopUpDrafts((current) => {
                      if (!current) {
                        return current;
                      }
                      return {
                        ...current,
                        [pack.id]: { ...current[pack.id]!, price: event.target.value },
                      };
                    })
                  }
                />
              </div>
            );
          })}
        </div>
      </Card>

      {saveError ? <p className="text-sm text-[var(--color-danger)]">{saveError}</p> : null}
      {feedback ? (
        <p className="text-sm font-semibold text-[var(--color-success)]" role="status">
          {feedback}
        </p>
      ) : null}

      <Button type="button" onClick={() => void handleSave()} disabled={saving}>
        {saving ? 'در حال ذخیره...' : 'ذخیره قیمت‌ها'}
      </Button>
    </div>
  );
}
