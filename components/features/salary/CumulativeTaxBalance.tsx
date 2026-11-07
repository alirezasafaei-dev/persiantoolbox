'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import NumericInput from '@/shared/ui/NumericInput';
import { formatMoneyFa, parseLooseNumber } from '@/shared/utils/numbers';
import { calculateCumulativePayrollTax } from '@/features/salary/cumulative-tax';
import { calculateRegionalPayrollTax } from '@/features/salary/regional-tax';

const months = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

export default function CumulativeTaxBalance() {
  const [month, setMonth] = useState(1);
  const [ordinaryText, setOrdinaryText] = useState('0');
  const [specialText, setSpecialText] = useState('0');
  const [researchText, setResearchText] = useState('0');
  const [previousText, setPreviousText] = useState('0');
  const [hasRelief, setHasRelief] = useState(false);
  const [regional, setRegional] = useState(false);
  const [listConfirmed, setListConfirmed] = useState(false);
  const [employmentConfirmed, setEmploymentConfirmed] = useState(false);
  const [periodConfirmed, setPeriodConfirmed] = useState(false);
  const [noOtherRelief, setNoOtherRelief] = useState(false);
  const ordinary = parseLooseNumber(ordinaryText);
  const special = parseLooseNumber(specialText);
  const research = parseLooseNumber(researchText);
  const previousTax = parseLooseNumber(previousText);
  let result: ReturnType<typeof calculateCumulativePayrollTax> | null = null;
  let error = '';
  let regionalBreakdown: { taxBeforeRelief: number; regionalRelief: number } | null = null;
  if (!hasRelief) {
    if (ordinary === null || special === null || research === null || previousTax === null) {
      error = 'همهٔ مبالغ را با عدد معتبر و نامنفی وارد کنید؛ برای مبلغ بدون دریافتی، صفر بنویسید.';
    } else {
      try {
        const input = { month, ordinary, special, research, previousTax };
        if (regional) {
          const calculated = calculateRegionalPayrollTax(input, {
            currentOfficialListConfirmed: listConfirmed,
            employmentConfirmed,
            entirePeriodConfirmed: periodConfirmed,
            noOtherReliefConfirmed: noOtherRelief,
          });
          result = calculated;
          regionalBreakdown = calculated;
        } else {
          result = calculateCumulativePayrollTax(input);
        }
      } catch (cause) {
        error = cause instanceof Error ? cause.message : 'مبالغ واردشده معتبر نیستند.';
      }
    }
  }
  return (
    <Card className="space-y-4 p-6" data-testid="cumulative-tax-balance">
      <h2 className="text-lg font-semibold">مالیات تجمعی فهرست حقوق ۱۴۰۵</h2>
      <p className="text-sm text-(--text-muted)">
        جمع دریافتی‌های خالص از ابتدای سال تا فهرست جاریِ مورد بررسی را وارد کنید؛ مبالغ باید پس از
        معافیت اقلام و کسورات قانونی و پیش از معافیت عمومی مادهٔ ۸۴ باشند. معافیت عمومی را دوباره کم
        نکنید. ماه، ماه حقوق/پرداختِ مربوط به فهرست است؛ تاریخ ارسال، تعداد ماه‌های اشتغال یا تعداد
        فهرست‌ها نیست. برای فهرست فروردین که دیر ارسال می‌شود هم فروردین را انتخاب کنید. تطبیق
        اطلاعات سایر کارفرمایان و تسهیم بدهی بین آن‌ها را سامانهٔ رسمی انجام می‌دهد؛ این فرم به
        پرونده‌های کارفرمایان دسترسی ندارد. محاسبه فقط در مرورگر انجام می‌شود و اطلاعاتی ارسال
        نمی‌شود.
      </p>
      <a
        className="text-sm underline"
        href="https://www.tax.gov.ir/action/do/download/227"
        target="_blank"
        rel="noopener noreferrer"
      >
        راهنمای رسمی محاسبات تجمعی ۱۴۰۵ سازمان امور مالیاتی
      </a>
      <div className="space-y-2">
        <label htmlFor="cumulative-tax-month" className="block text-sm font-medium">
          ماه فهرست در سال ۱۴۰۵
        </label>
        <select
          id="cumulative-tax-month"
          value={month}
          onChange={(event) => setMonth(Number(event.target.value))}
          className="min-h-11 w-full rounded-lg border border-(--border-light) bg-(--surface-1) p-3 text-(--text-primary)"
        >
          {months.map((name, index) => (
            <option key={name} value={index + 1}>
              {name}
            </option>
          ))}
        </select>
      </div>
      <label htmlFor="cumulative-tax-region" className="flex min-h-11 items-start gap-3 text-sm">
        <input
          id="cumulative-tax-region"
          type="checkbox"
          checked={regional}
          onChange={(event) => {
            setRegional(event.target.checked);
            setListConfirmed(false);
            setEmploymentConfirmed(false);
            setPeriodConfirmed(false);
            setNoOtherRelief(false);
          }}
          className="mt-1 size-5 shrink-0"
        />
        درخواست بخشودگی مادهٔ ۹۲ برای درآمد عادی A در تمام دورهٔ تجمعی
      </label>
      {regional ? (
        <fieldset className="space-y-3 rounded-lg border border-(--border-light) p-4">
          <legend className="px-1 text-sm font-semibold">شرایط بخشودگی منطقه‌ای</legend>
          <p className="text-sm text-(--text-muted)">
            این ابزار محل را از روی نشانی سکونت تشخیص نمی‌دهد. فقط درآمد کارمندی عادی که تمام دورهٔ
            آن مشمول است پشتیبانی می‌شود؛ مأموریت، بخشی از سال، درآمد B/D و ترکیب با معافیت دیگر
            پوشش ندارد.
          </p>
          {[
            {
              id: 'list',
              checked: listConfirmed,
              set: setListConfirmed,
              text: 'عضویت محل اشتغال در فهرست رسمی معتبر برای دورهٔ مربوط را با مرجع ذی‌صلاح بررسی کرده‌ام.',
            },
            {
              id: 'employment',
              checked: employmentConfirmed,
              set: setEmploymentConfirmed,
              text: 'محل واجد شرایط در حکم استخدامی درج شده و اشتغال واقعی احراز شده است؛ حضور صرفاً مأموریتی نیست.',
            },
            {
              id: 'period',
              checked: periodConfirmed,
              set: setPeriodConfirmed,
              text: 'تمام درآمد عادی A و همهٔ فهرست‌های قبلیِ منظورشده در مالیات قبلی، در تمام دورهٔ تجمعی مشمول همین بخشودگی‌اند؛ درآمد یا دورهٔ غیرمشمول وجود ندارد.',
            },
            {
              id: 'other',
              checked: noOtherRelief,
              set: setNoOtherRelief,
              text: 'در این مبالغ هیچ معافیت شخصی یا ترکیبی دیگری مانند معلولیت یا جوانی جمعیت اعمال نشده و درخواست نمی‌شود.',
            },
          ].map(({ id, checked, set, text }) => (
            <label
              key={id}
              htmlFor={`region-confirm-${id}`}
              className="flex min-h-11 items-start gap-3 text-sm"
            >
              <input
                id={`region-confirm-${id}`}
                type="checkbox"
                checked={checked}
                onChange={(event) => set(event.target.checked)}
                className="mt-1 size-5 shrink-0"
              />
              {text}
            </label>
          ))}
          <a
            className="text-sm underline"
            target="_blank"
            rel="noopener noreferrer"
            href="https://regulation.tax.gov.ir/lwvi?lid=txs5000089690&ty=mq"
          >
            تفسیر رسمی مادهٔ ۹۲ و شرایط اشتغال
          </a>
          <p className="text-xs text-(--text-muted)">
            تأیید این گزینه‌ها جایگزین رسیدگی مالیاتی یا احراز مدارک نیست. مبلغ بخشودگی، نصف مالیات
            تجمعی است؛ مالیات فهرست‌های قبلی بعد از بخشودگی کسر می‌شود.
          </p>
        </fieldset>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <NumericInput
          id="cumulative-tax-ordinary"
          label="جمع دریافتی عادی A (تومان)"
          value={ordinaryText}
          onValueChange={setOrdinaryText}
          allowDecimal={false}
          helperText="دریافتی مشمول جدول پلکانی؛ شامل پرداخت‌های اصلی و غیراصلی طبقه‌بندی‌شده طبق راهنما."
        />
        <NumericInput
          id="cumulative-tax-special"
          label="جمع دریافتی خاص B (تومان)"
          value={specialText}
          onValueChange={setSpecialText}
          allowDecimal={false}
          helperText="فقط حقوق اعضای هیئت علمی دانشگاه‌ها و مؤسسات آموزشی/پژوهشی و قضات؛ نرخ ۱۰٪ پس از سهم معافیت. سایر مشاغل را صرفاً به‌دلیل عنوان شغل در این گروه وارد نکنید."
        />
        <NumericInput
          id="cumulative-tax-research"
          label="جمع قرارداد پژوهشی D (تومان)"
          value={researchText}
          onValueChange={setResearchText}
          allowDecimal={false}
          helperText="فقط قرارداد پژوهشی مشمول تبصرهٔ ۲ مادهٔ ۸۶؛ نرخ ۵٪ بدون معافیت عمومی. هر حق تحقیق یا حق پژوهش، قرارداد پژوهشی این تبصره نیست."
        />
        <NumericInput
          id="cumulative-tax-previous"
          label="مالیات محاسبه‌شدهٔ فهرست‌های قبلی (تومان)"
          value={previousText}
          onValueChange={setPreviousText}
          allowDecimal={false}
          helperText="جمع مالیات محاسبه‌شده تا پیش از این فهرست، از جمله فهرست قبلی همین ماه؛ مبلغ صرفاً واریزشده جایگزین این عدد نیست."
        />
      </div>
      <label htmlFor="cumulative-tax-relief" className="flex min-h-11 items-start gap-3 text-sm">
        <input
          id="cumulative-tax-relief"
          type="checkbox"
          checked={hasRelief}
          onChange={(event) => setHasRelief(event.target.checked)}
          className="mt-1 size-5 shrink-0"
        />
        معافیت یا تخفیف دیگری دارم (مانند ایثارگری، معلولیت، جوانی جمعیت، پارک فناوری یا حالت
        منطقه‌ای خارج از شرایط بخش بالا).
      </label>
      {hasRelief ? (
        <p role="alert" className="text-sm text-(--text-muted)">
          برای این معافیت‌ها نتیجه صادر نمی‌شود؛ احراز شرایط و ترکیب تخفیف‌ها در این محاسبه پوشش
          ندارد. مبلغ نهایی را در سامانهٔ رسمی مالیات حقوق کنترل کنید. نرخ‌های خاص B و D با این
          معافیت‌ها متفاوت‌اند.
        </p>
      ) : null}
      {hasRelief ? (
        <div className="space-y-2 text-sm text-(--text-muted)">
          <p>
            معلولیت: معافیت مادهٔ ۲۵ برای یکی از اولیای شاغلِ دارای گواهی بهزیستی و مسئول هزینه‌های
            فرد دارای معلولیت شدید یا خیلی شدید است؛ این ابزار ترتیب و ترکیب آن را محاسبه نمی‌کند.
          </p>
          <a
            className="block underline"
            target="_blank"
            rel="noopener noreferrer"
            href="https://regulation.tax.gov.ir/lwvi?lid=txs5000086937&ty=mq"
          >
            آیین‌نامهٔ رسمی مادهٔ ۲۵
          </a>
          <p>
            جوانی جمعیت: تعداد فرزند به‌تنهایی کافی نیست؛ حکم بودجهٔ سال، شرایط تولد و آخرین نرخ
            باروری اعلام‌شدهٔ مرجع رسمی باید احراز شود.
          </p>
          <a
            className="block underline"
            target="_blank"
            rel="noopener noreferrer"
            href="https://dotic.ir/news/20776"
          >
            نظر رسمی دربارهٔ مبنای نرخ باروری
          </a>
        </div>
      ) : null}
      {error ? <p role="alert">{error}</p> : null}
      {result ? (
        <div
          role="region"
          aria-label="نتیجهٔ مالیات تجمعی"
          aria-live="polite"
          className="space-y-2"
        >
          <p>سهم معافیت A: {formatMoneyFa(result.ordinaryExemption)} تومان</p>
          <p>سهم معافیت B: {formatMoneyFa(result.specialExemption)} تومان</p>
          <p>مالیات تجمعی A: {formatMoneyFa(result.ordinaryTax)} تومان</p>
          <p>مالیات تجمعی B: {formatMoneyFa(result.specialTax)} تومان</p>
          <p>مالیات تجمعی D: {formatMoneyFa(result.researchTax)} تومان</p>
          {regionalBreakdown ? (
            <>
              <p>
                مالیات پیش از بخشودگی منطقه‌ای: {formatMoneyFa(regionalBreakdown.taxBeforeRelief)}{' '}
                تومان
              </p>
              <p>بخشودگی مادهٔ ۹۲: {formatMoneyFa(regionalBreakdown.regionalRelief)} تومان</p>
            </>
          ) : null}
          <p>جمع مالیات تا این فهرست: {formatMoneyFa(result.cumulativeTax)} تومان</p>
          <p>اختلاف فهرست جاری: {formatMoneyFa(result.currentTax)} تومان</p>
          <p>مبلغ مثبت قابل کسر این فهرست: {formatMoneyFa(result.payable)} تومان</p>
          <p>اختلاف منفی برای بررسی اصلاح یا بستانکاری: {formatMoneyFa(result.credit)} تومان</p>
          <p className="text-xs text-(--text-muted)">
            نمایش مبالغ به تومان و گرد‌شده است؛ محاسبه با دقت اصلی انجام می‌شود. اختلاف منفی به
            معنای استرداد خودکار یا اجازهٔ کسر از قبض نیست؛ ثبت اصلاح یا استرداد تابع بررسی سامانهٔ
            رسمی است. طبقه‌بندی اقلام و مدارک استحقاق بر عهدهٔ تهیه‌کنندهٔ فهرست است.
          </p>
        </div>
      ) : null}
    </Card>
  );
}
