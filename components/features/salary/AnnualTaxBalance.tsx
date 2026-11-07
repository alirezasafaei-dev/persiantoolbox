'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import NumericInput from '@/shared/ui/NumericInput';
import { parseLooseNumber, formatMoneyFa } from '@/shared/utils/numbers';
import { calculateAnnualTaxBalance } from '@/features/salary/annual-tax';

export default function AnnualTaxBalance() {
  const [incomeText, setIncomeText] = useState('');
  const [withheldText, setWithheldText] = useState('0');
  const income = parseLooseNumber(incomeText);
  const withheld = parseLooseNumber(withheldText);
  const valid = income !== null && withheld !== null && income >= 0 && withheld >= 0;
  const result = valid ? calculateAnnualTaxBalance(income, withheld) : null;
  return (
    <Card className="p-6 space-y-4" data-testid="annual-tax-balance">
      <h2 className="text-lg font-semibold">برآورد مالیات تجمیعی کل سال ۱۴۰۵</h2>
      <p className="text-sm text-(--text-muted)">
        جمع درآمد مشمولِ همهٔ کارفرماها در کل سال را پس از حذف اقلام معاف و کسر بیمهٔ مجاز وارد
        کنید؛ معافیت عمومی سالانهٔ ۴۸۰ میلیون تومان را خودتان کم نکنید. جدول رسمی این معافیت را
        یک‌بار اعمال می‌کند. این بخش برای برآورد پایان سال با نرخ‌های عادی است؛ کسور ماهانهٔ حین
        سال، نرخ‌های خاص و احراز مدارک را تعیین نمی‌کند.
      </p>
      <a
        className="text-sm underline"
        href="https://dotic.ir/news/20326"
        target="_blank"
        rel="noopener noreferrer"
      >
        جدول رسمی مالیات ۱۴۰۵
      </a>
      <div className="grid gap-4 md:grid-cols-2">
        <NumericInput
          id="annual-tax-income"
          label="جمع درآمد مشمول کل سال (تومان)"
          value={incomeText}
          onValueChange={setIncomeText}
          allowDecimal={false}
        />
        <NumericInput
          id="annual-tax-withheld"
          label="مالیات کسرشده در کل سال (تومان)"
          value={withheldText}
          onValueChange={setWithheldText}
          allowDecimal={false}
        />
      </div>
      {!valid && incomeText !== '' ? (
        <p role="alert">مبالغ سالانه باید عدد معتبر و نامنفی باشند.</p>
      ) : null}
      {result ? (
        <div
          role="region"
          aria-label="نتیجه مالیات سالانه"
          aria-live="polite"
          className="space-y-2"
        >
          <p>مالیات سالانه: {formatMoneyFa(result.annualTax)} تومان</p>
          <p>ماندهٔ قابل پرداخت برآوردی: {formatMoneyFa(result.remaining)} تومان</p>
          <p>اضافه‌پرداخت احتمالی: {formatMoneyFa(result.overpaid)} تومان</p>
          <p className="text-xs text-(--text-muted)">
            اضافه‌پرداخت، تأیید استرداد نیست و نیاز به رسیدگی و مدارک دارد. اطلاعات فقط در مرورگر
            محاسبه می‌شوند.
          </p>
        </div>
      ) : null}
    </Card>
  );
}
