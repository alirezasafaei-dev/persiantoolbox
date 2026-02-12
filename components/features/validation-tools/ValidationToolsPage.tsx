'use client';

import { useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui';
import Input from '@/shared/ui/Input';
import { useToast } from '@/shared/ui/toast-context';
import {
  isValidCardNumber,
  isValidIranianMobile,
  isValidIranianPlate,
  isValidIranianPostalCode,
  isValidIranianSheba,
  isValidNationalId,
  normalizeIranianMobile,
} from '@/shared/utils/validation';

const ResultBadge = ({ ok, text }: { ok: boolean; text: string }) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
      ok
        ? 'bg-[rgb(var(--color-success-rgb)/0.16)] text-[var(--color-success)]'
        : 'bg-[rgb(var(--color-danger-rgb)/0.12)] text-[var(--color-danger)]'
    }`}
  >
    {text}
  </span>
);

export default function ValidationToolsPage() {
  const { showToast } = useToast();
  const nationalIdRef = useRef<HTMLInputElement | null>(null);
  const mobileRef = useRef<HTMLInputElement | null>(null);
  const cardRef = useRef<HTMLInputElement | null>(null);
  const shebaRef = useRef<HTMLInputElement | null>(null);
  const postalRef = useRef<HTMLInputElement | null>(null);
  const plateRef = useRef<HTMLInputElement | null>(null);
  const [nationalId, setNationalId] = useState('');
  const [mobile, setMobile] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [sheba, setSheba] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [plate, setPlate] = useState('');
  const [showNationalId, setShowNationalId] = useState(true);
  const [showCard, setShowCard] = useState(true);
  const [showSheba, setShowSheba] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyText = async (value: string, field: string) => {
    const text = value.trim();
    if (!text) {
      return;
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const temp = document.createElement('textarea');
        temp.value = text;
        temp.style.position = 'fixed';
        temp.style.opacity = '0';
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
      setCopiedField(field);
      showToast('با موفقیت کپی شد', 'success');
      setTimeout(() => setCopiedField((current) => (current === field ? null : current)), 2000);
    } catch {
      setCopiedField(null);
      showToast('کپی انجام نشد', 'error');
    }
  };

  const digitsOnly = (value: string) => value.replace(/\D+/g, '');
  const formatNationalId = (value: string) => {
    const digits = digitsOnly(value).slice(0, 10);
    if (digits.length <= 3) {
      return digits;
    }
    if (digits.length <= 6) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    }
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  };
  const formatCardNumber = (value: string) => {
    const digits = digitsOnly(value).slice(0, 16);
    return digits.replace(/(.{4})/g, '$1-').replace(/-$/, '');
  };
  const formatSheba = (value: string) => {
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const normalized = cleaned.startsWith('IR') ? cleaned : `IR${cleaned.replace(/^IR/i, '')}`;
    const trimmed = normalized.slice(0, 26);
    const prefix = trimmed.slice(0, 4);
    const rest = trimmed
      .slice(4)
      .replace(/(.{4})/g, '$1 ')
      .trim();
    return rest ? `${prefix} ${rest}` : prefix;
  };
  const formatMobile = (value: string) => {
    const digits = digitsOnly(value).slice(0, 11);
    if (digits.length <= 4) {
      return digits;
    }
    if (digits.length <= 7) {
      return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    }
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  };
  const formatPostal = (value: string) => {
    const digits = digitsOnly(value).slice(0, 10);
    if (digits.length <= 5) {
      return digits;
    }
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  };

  const nationalOk = useMemo(
    () => (nationalId ? isValidNationalId(nationalId) : false),
    [nationalId],
  );
  const mobileNormalized = useMemo(() => normalizeIranianMobile(mobile), [mobile]);
  const mobileOk = useMemo(() => (mobile ? isValidIranianMobile(mobile) : false), [mobile]);
  const cardOk = useMemo(() => (cardNumber ? isValidCardNumber(cardNumber) : false), [cardNumber]);
  const shebaOk = useMemo(() => (sheba ? isValidIranianSheba(sheba) : false), [sheba]);
  const postalOk = useMemo(
    () => (postalCode ? isValidIranianPostalCode(postalCode) : false),
    [postalCode],
  );
  const plateOk = useMemo(() => (plate ? isValidIranianPlate(plate) : false), [plate]);

  const getCardTone = (value: string, ok: boolean) => {
    if (!value) {
      return '';
    }
    return ok
      ? 'bg-[rgb(var(--color-success-rgb)/0.08)] border-[rgb(var(--color-success-rgb)/0.3)]'
      : 'bg-[rgb(var(--color-danger-rgb)/0.08)] border-[rgb(var(--color-danger-rgb)/0.3)]';
  };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
          <span className="h-2 w-2 rounded-full bg-[var(--color-success)]"></span>
          ابزارهای اعتبارسنجی - کاملاً آفلاین
        </div>
        <h1 className="text-3xl font-black text-[var(--text-primary)]">
          اعتبارسنجی داده‌های ایرانی
        </h1>
        <p className="text-[var(--text-secondary)]">
          کد ملی، موبایل، کارت بانکی، شبا، کدپستی و پلاک خودرو را سریع بررسی کنید.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className={`p-5 md:p-6 space-y-4 ${getCardTone(nationalId, nationalOk)}`}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-[var(--text-primary)]">کد ملی</div>
            {nationalId && <ResultBadge ok={nationalOk} text={nationalOk ? 'معتبر' : 'نامعتبر'} />}
          </div>
          <Input
            label="کد ملی ۱۰ رقمی"
            type={showNationalId ? 'text' : 'password'}
            value={showNationalId ? formatNationalId(nationalId) : digitsOnly(nationalId)}
            onChange={(e) => setNationalId(digitsOnly(e.target.value))}
            dir="ltr"
            placeholder="0010350829"
            inputMode="numeric"
            ref={nationalIdRef}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                mobileRef.current?.focus();
              }
            }}
            endAction={
              <button
                type="button"
                className="text-xs font-semibold text-[var(--text-muted)]"
                onClick={() => setShowNationalId((prev) => !prev)}
              >
                {showNationalId ? 'مخفی' : 'نمایش'}
              </button>
            }
          />
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>فرمت استاندارد: ۱۲۳-۴۵۶-۷۸۹۰</span>
            <button
              type="button"
              className="font-semibold text-[var(--color-primary)]"
              onClick={() => copyText(digitsOnly(nationalId), 'nationalId')}
            >
              {copiedField === 'nationalId' ? 'کپی شد' : 'کپی مقدار'}
            </button>
          </div>
        </Card>

        <Card className={`p-5 md:p-6 space-y-4 ${getCardTone(mobile, mobileOk)}`}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-[var(--text-primary)]">شماره موبایل</div>
            {mobile && <ResultBadge ok={mobileOk} text={mobileOk ? 'معتبر' : 'نامعتبر'} />}
          </div>
          <Input
            label="موبایل ایران"
            value={formatMobile(mobile)}
            onChange={(e) => setMobile(digitsOnly(e.target.value))}
            dir="ltr"
            placeholder="09123456789 یا +989123456789"
            inputMode="numeric"
            ref={mobileRef}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                cardRef.current?.focus();
              }
            }}
          />
          {mobileNormalized && (
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>
                نرمال‌شده: <span dir="ltr">{mobileNormalized}</span>
              </span>
              <button
                type="button"
                className="font-semibold text-[var(--color-primary)]"
                onClick={() => copyText(mobileNormalized, 'mobile')}
              >
                {copiedField === 'mobile' ? 'کپی شد' : 'کپی مقدار'}
              </button>
            </div>
          )}
        </Card>

        <Card className={`p-5 md:p-6 space-y-4 ${getCardTone(cardNumber, cardOk)}`}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-[var(--text-primary)]">کارت بانکی</div>
            {cardNumber && <ResultBadge ok={cardOk} text={cardOk ? 'معتبر' : 'نامعتبر'} />}
          </div>
          <Input
            label="شماره کارت ۱۶ رقمی"
            type={showCard ? 'text' : 'password'}
            value={showCard ? formatCardNumber(cardNumber) : digitsOnly(cardNumber)}
            onChange={(e) => setCardNumber(digitsOnly(e.target.value))}
            dir="ltr"
            placeholder="6037-9918-9412-3456"
            inputMode="numeric"
            ref={cardRef}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                shebaRef.current?.focus();
              }
            }}
            endAction={
              <button
                type="button"
                className="text-xs font-semibold text-[var(--text-muted)]"
                onClick={() => setShowCard((prev) => !prev)}
              >
                {showCard ? 'مخفی' : 'نمایش'}
              </button>
            }
          />
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>فرمت استاندارد: ۶۰۳۷-۹۹۱۸-۹۴۱۲-۳۴۵۶</span>
            <button
              type="button"
              className="font-semibold text-[var(--color-primary)]"
              onClick={() => copyText(digitsOnly(cardNumber), 'card')}
            >
              {copiedField === 'card' ? 'کپی شد' : 'کپی مقدار'}
            </button>
          </div>
        </Card>

        <Card className={`p-5 md:p-6 space-y-4 ${getCardTone(sheba, shebaOk)}`}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-[var(--text-primary)]">شماره شبا</div>
            {sheba && <ResultBadge ok={shebaOk} text={shebaOk ? 'معتبر' : 'نامعتبر'} />}
          </div>
          <Input
            label="شبا (IR)"
            type={showSheba ? 'text' : 'password'}
            value={showSheba ? formatSheba(sheba) : sheba.replace(/\s+/g, '')}
            onChange={(e) => setSheba(e.target.value.replace(/\s+/g, ''))}
            dir="ltr"
            placeholder="IR062960000000100324200001"
            inputMode="numeric"
            ref={shebaRef}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                postalRef.current?.focus();
              }
            }}
            endAction={
              <button
                type="button"
                className="text-xs font-semibold text-[var(--text-muted)]"
                onClick={() => setShowSheba((prev) => !prev)}
              >
                {showSheba ? 'مخفی' : 'نمایش'}
              </button>
            }
          />
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>فرمت استاندارد: IRxx xxxx xxxx xxxx xxxx xxxx xx</span>
            <button
              type="button"
              className="font-semibold text-[var(--color-primary)]"
              onClick={() => copyText(sheba.replace(/\s+/g, ''), 'sheba')}
            >
              {copiedField === 'sheba' ? 'کپی شد' : 'کپی مقدار'}
            </button>
          </div>
        </Card>

        <Card className={`p-5 md:p-6 space-y-4 ${getCardTone(postalCode, postalOk)}`}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-[var(--text-primary)]">کد پستی</div>
            {postalCode && <ResultBadge ok={postalOk} text={postalOk ? 'معتبر' : 'نامعتبر'} />}
          </div>
          <Input
            label="کدپستی ۱۰ رقمی"
            value={formatPostal(postalCode)}
            onChange={(e) => setPostalCode(digitsOnly(e.target.value))}
            dir="ltr"
            placeholder="1234567890"
            inputMode="numeric"
            ref={postalRef}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                plateRef.current?.focus();
              }
            }}
          />
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>فرمت استاندارد: ۱۲۳۴۵-۶۷۸۹۰</span>
            <button
              type="button"
              className="font-semibold text-[var(--color-primary)]"
              onClick={() => copyText(digitsOnly(postalCode), 'postal')}
            >
              {copiedField === 'postal' ? 'کپی شد' : 'کپی مقدار'}
            </button>
          </div>
        </Card>

        <Card className={`p-5 md:p-6 space-y-4 ${getCardTone(plate, plateOk)}`}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-[var(--text-primary)]">پلاک خودرو</div>
            {plate && <ResultBadge ok={plateOk} text={plateOk ? 'معتبر' : 'نامعتبر'} />}
          </div>
          <Input
            label="فرمت پلاک ایران"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            dir="ltr"
            placeholder="12ب34567"
            ref={plateRef}
          />
        </Card>
      </div>
    </div>
  );
}
