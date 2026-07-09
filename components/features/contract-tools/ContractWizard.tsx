'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, Button } from '@/components/ui';
import { DISCLAIMER, type ContractTemplateId } from '@/lib/contract-tools/types';
import { renderContract, hashText } from '@/lib/contract-tools/render';
import { getTemplate, getAllTemplates } from '@/lib/contract-tools/templates';
import ContractFormFields from './ContractFormFields';
import ContractClauseSelector from './ContractClauseSelector';
import ContractPreview from './ContractPreview';
import ExportPanel from './ExportPanel';
import DraftHistory from './DraftHistory';
import { saveDraft, createDraftId, type DraftRecord } from '@/lib/contract-tools/draft-storage';
import Link from 'next/link';

type Step = 'select' | 'parties' | 'details' | 'clauses' | 'preview' | 'export';

const STEP_LABELS: Record<Step, string> = {
  select: 'انتخاب نوع قرارداد',
  parties: 'اطلاعات طرفین',
  details: 'جزئیات قرارداد',
  clauses: 'بندهای قرارداد',
  preview: 'پیش‌نمایش',
  export: 'دانلود',
};

const STEP_ORDER: Step[] = ['select', 'parties', 'details', 'clauses', 'preview', 'export'];

type Props = {
  initialTemplateId?: string;
};

export default function ContractWizard({ initialTemplateId }: Props) {
  const [step, setStep] = useState<Step>(initialTemplateId ? 'parties' : 'select');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplateId ?? '');
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedClauses, setSelectedClauses] = useState<string[]>([]);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [renderedText, setRenderedText] = useState('');
  const [, setTextHash] = useState('');
  const [draftId] = useState(() => createDraftId());

  const template = selectedTemplateId ? getTemplate(selectedTemplateId) : undefined;
  const allTemplates = getAllTemplates();

  useEffect(() => {
    if (template) {
      const defaultClauses = template.clauses
        .filter((c) => c.defaultEnabled || c.required)
        .map((c) => c.id);
      setSelectedClauses(defaultClauses);
    }
  }, [template]);

  const handleFieldChange = useCallback((fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  }, []);

  const handleClauseToggle = useCallback((clauseId: string) => {
    setSelectedClauses((prev) =>
      prev.includes(clauseId) ? prev.filter((id) => id !== clauseId) : [...prev, clauseId],
    );
  }, []);

  useEffect(() => {
    if (!selectedTemplateId || Object.keys(values).length === 0) {
      return;
    }
    const timer = setTimeout(() => {
      saveDraft({
        id: draftId,
        templateId: selectedTemplateId as ContractTemplateId,
        templateVersion: template?.version ?? '1.0.0',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        inputs: values,
        selectedClauses,
        name:
          values['landlord.name'] ??
          values['client.name'] ??
          `پیش‌نویس ${new Date().toLocaleDateString('fa-IR')}`,
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [values, selectedClauses, selectedTemplateId, template, draftId]);

  const handleLoadDraft = useCallback((draft: DraftRecord) => {
    setValues(draft.inputs);
    setSelectedClauses(draft.selectedClauses);
    setStep('details');
  }, []);

  const generatePreview = useCallback(() => {
    if (!template) {
      return;
    }
    const text = renderContract(template.templateId, template, values, selectedClauses, true);
    setRenderedText(text);
    hashText(text).then(setTextHash);
  }, [template, values, selectedClauses]);

  const goNext = useCallback(() => {
    if (step === 'preview') {
      generatePreview();
    }
    const idx = STEP_ORDER.indexOf(step);
    if (idx < STEP_ORDER.length - 1) {
      setStep(STEP_ORDER[idx + 1] as (typeof STEP_ORDER)[number]);
    }
  }, [step, generatePreview]);

  const goBack = useCallback(() => {
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) {
      setStep(STEP_ORDER[idx - 1] as (typeof STEP_ORDER)[number]);
    }
  }, [step]);

  const stepIndex = STEP_ORDER.indexOf(step);
  const progress = ((stepIndex + 1) / STEP_ORDER.length) * 100;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
            {template?.title ?? 'ساخت پیش‌نویس قرارداد'}
          </h1>
        </div>
        <p className="text-sm text-[var(--text-muted)]">
          این ابزار صرفاً پیش‌نویس قرارداد تولید می‌کند و جایگزین مشاوره حقوقی نیست.
        </p>
      </div>

      <nav aria-label="مراحل قرارداد" className="space-y-2">
        <div className="flex items-center gap-2 text-xs">
          {STEP_ORDER.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${(() => {
                  if (i < stepIndex) {
                    return 'bg-[var(--color-success)] text-[var(--text-inverted)]';
                  }
                  if (i === stepIndex) {
                    return 'bg-[var(--color-primary)] text-[var(--text-inverted)]';
                  }
                  return 'bg-[var(--surface-2)] text-[var(--text-muted)]';
                })()}`}
              >
                {i < stepIndex ? '✓' : i + 1}
              </span>
              <span
                className={`${i === stepIndex ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-muted)]'}`}
              >
                {STEP_LABELS[s]}
              </span>
              {i < STEP_ORDER.length - 1 && <span className="text-[var(--text-muted)]">←</span>}
            </div>
          ))}
        </div>
        <div className="h-1.5 rounded-full bg-[var(--surface-2)]">
          <div
            className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </nav>

      <Card className="p-6">
        {step === 'select' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              نوع قرارداد را انتخاب کنید
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {allTemplates.map((t) => (
                <button
                  key={t.templateId}
                  type="button"
                  onClick={() => {
                    setSelectedTemplateId(t.templateId);
                    setStep('parties');
                  }}
                  className={`text-right rounded-[var(--radius-md)] border p-5 transition-all ${
                    selectedTemplateId === t.templateId
                      ? 'border-[var(--color-primary)] bg-[rgb(var(--color-primary-rgb)/0.05)]'
                      : 'border-[var(--border-light)] bg-[var(--surface-1)] hover:border-[var(--color-primary)]'
                  }`}
                >
                  <div className="text-base font-bold text-[var(--text-primary)]">{t.title}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-2 leading-5">
                    {t.description}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-3">
                    {t.fields.length} فیلد · {t.clauses.length + t.optionalClauses.length} بند
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t border-[var(--border-light)] pt-6">
              <DraftHistory templateId="rental-lease" onLoadDraft={handleLoadDraft} />
            </div>
          </div>
        )}

        {step === 'parties' && template ? (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">اطلاعات طرفین قرارداد</h2>
            <ContractFormFields
              fields={template.fields.filter(
                (f) =>
                  f.group === 'landlord' ||
                  f.group === 'tenant' ||
                  f.group === 'client' ||
                  f.group === 'contractor',
              )}
              values={values}
              errors={errors}
              onChange={handleFieldChange}
            />
          </div>
        ) : null}

        {step === 'details' && template ? (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">جزئیات قرارداد</h2>
            <ContractFormFields
              fields={template.fields.filter(
                (f) => !['landlord', 'tenant', 'client', 'contractor'].includes(f.group),
              )}
              values={values}
              errors={errors}
              onChange={handleFieldChange}
            />
          </div>
        ) : null}

        {step === 'clauses' && template ? (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">بندهای قرارداد</h2>
            <ContractClauseSelector
              clauses={template.clauses}
              optionalClauses={template.optionalClauses}
              selectedClauses={selectedClauses}
              onToggle={handleClauseToggle}
            />
          </div>
        ) : null}

        {step === 'preview' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">پیش‌نمایش قرارداد</h2>
            <p className="text-sm text-[var(--text-muted)]">
              متن قرارداد را بررسی کنید. قبل از دانلود، سلب مسئولیت را تأیید کنید.
            </p>
            <ContractPreview renderedText={renderedText} isPremium={false} />
            <div className="rounded-[var(--radius-md)] border border-[rgb(var(--color-info-rgb)/0.3)] bg-[rgb(var(--color-info-rgb)/0.08)] p-4">
              <p className="text-xs text-[var(--color-info)] leading-6">
                اطلاعات قرارداد تا حد امکان در مرورگر شما پردازش می‌شود. هیچ داده‌ای به سرور ارسال
                نمی‌شود.
              </p>
            </div>
          </div>
        )}

        {step === 'export' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">دانلود قرارداد</h2>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={disclaimerAccepted}
                onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--border-light)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                aria-label="تأیید سلب مسئولیت"
              />
              <span className="text-xs text-[var(--text-secondary)] leading-5">{DISCLAIMER}</span>
            </label>

            {disclaimerAccepted ? (
              <ExportPanel
                renderedText={renderedText}
                templateId={selectedTemplateId}
                isPremium={false}
              />
            ) : null}
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="tertiary" onClick={goBack} disabled={stepIndex === 0}>
          بازگشت
        </Button>
        {step !== 'export' && step !== 'select' && (
          <Button onClick={goNext}>{step === 'preview' ? 'تأیید و دانلود' : 'مرحله بعد'}</Button>
        )}
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 text-center space-y-2">
        <p className="text-xs text-[var(--text-muted)] leading-5">{DISCLAIMER}</p>
        <Link
          href="/contract-tools"
          className="text-xs text-[var(--color-primary)] hover:underline"
        >
          بازگشت به صفحه ابزارهای قرارداد
        </Link>
      </div>
    </div>
  );
}
