import type { ContractTemplate } from './types';
import { DISCLAIMER, DRAFT_WATERMARK } from './types';

function toPersianDigits(str: string): string {
  return str.replace(/\d/g, (d) => {
    const persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return persian[Number(d)] ?? d;
  });
}

function formatDate(dateStr: string): string {
  if (!dateStr) {
    return '________';
  }
  return toPersianDigits(dateStr);
}

function groupInputs(inputs: Record<string, string>): Record<string, Record<string, string>> {
  const groups: Record<string, Record<string, string>> = {};
  for (const [key, value] of Object.entries(inputs)) {
    const parts = key.split('.');
    if (parts.length === 2) {
      const group = parts[0] as string;
      const field = parts[1] as string;
      if (!groups[group]) {
        groups[group] = {};
      }
      groups[group][field] = value;
    } else {
      if (!groups['_root']) {
        groups['_root'] = {};
      }
      groups['_root'][key] = value;
    }
  }
  return groups;
}

export function renderRentalLease(
  template: ContractTemplate,
  inputs: Record<string, string>,
  selectedClauses: string[],
  includeWatermark: boolean,
): string {
  const g = groupInputs(inputs);
  const landlord = g['landlord'] ?? {};
  const tenant = g['tenant'] ?? {};
  const property = g['property'] ?? {};

  const lines: string[] = [];

  lines.push('═══════════════════════════════════════════════');
  if (includeWatermark) {
    lines.push(`⚠ ${DRAFT_WATERMARK}`);
    lines.push('');
  }
  lines.push('    قرارداد اجاره مسکونی');
  lines.push('═══════════════════════════════════════════════');
  lines.push('');
  lines.push(`تاریخ تنظیم: ${formatDate(inputs['startDate'] ?? '')}`);
  lines.push('');

  lines.push('───────────────────────────────────────────────');
  lines.push('مشخصات طرفین قرارداد');
  lines.push('───────────────────────────────────────────────');
  lines.push('');
  lines.push('موجر (مالک):');
  lines.push(`  نام: ${landlord['name'] ?? '________'}`);
  lines.push(`  کد ملی: ${toPersianDigits(landlord['nationalId'] ?? '________')}`);
  lines.push(`  تلفن: ${toPersianDigits(landlord['phone'] ?? '________')}`);
  lines.push(`  آدرس: ${landlord['address'] ?? '________'}`);
  lines.push('');
  lines.push('مستأجر:');
  lines.push(`  نام: ${tenant['name'] ?? '________'}`);
  lines.push(`  کد ملی: ${toPersianDigits(tenant['nationalId'] ?? '________')}`);
  lines.push(`  تلفن: ${toPersianDigits(tenant['phone'] ?? '________')}`);
  lines.push(`  آدرس: ${tenant['address'] ?? '________'}`);
  lines.push('');

  lines.push('───────────────────────────────────────────────');
  lines.push('مشخصات ملک مورد اجاره');
  lines.push('───────────────────────────────────────────────');
  lines.push(`  آدرس: ${property['address'] ?? '________'}`);
  lines.push(`  کد پستی: ${toPersianDigits(property['postalCode'] ?? '________')}`);
  lines.push(`  متراژ: ${toPersianDigits(property['area'] ?? '________')} متر مربع`);
  if (property['floor']) {
    lines.push(`  طبقه: ${toPersianDigits(property['floor'])}`);
  }
  if (property['unit']) {
    lines.push(`  واحد: ${toPersianDigits(property['unit'])}`);
  }
  lines.push(`  نوع سند: ${property['deedType'] ?? '________'}`);
  if (property['utilities']) {
    lines.push(`  انشعابات: ${property['utilities']}`);
  }
  if (property['fixtures']) {
    lines.push(`  لوازم: ${property['fixtures']}`);
  }
  lines.push('');

  lines.push('───────────────────────────────────────────────');
  lines.push('مدت و شرایط مالی');
  lines.push('───────────────────────────────────────────────');
  lines.push(`  تاریخ شروع اجاره: ${formatDate(inputs['startDate'] ?? '')}`);
  lines.push(`  تاریخ پایان اجاره: ${formatDate(inputs['endDate'] ?? '')}`);
  lines.push(`  تاریخ تحویل ملک: ${formatDate(inputs['deliveryDate'] ?? '')}`);
  lines.push(`  مبلغ ودیعه: ${toPersianDigits(inputs['depositAmount'] ?? '________')} تومان`);
  lines.push(`  اجاره ماهانه: ${toPersianDigits(inputs['monthlyRent'] ?? '________')} تومان`);
  lines.push(`  روز پرداخت: ${inputs['paymentDay'] ?? '________'}`);
  lines.push(`  روش پرداخت: ${inputs['paymentMethod'] ?? '________'}`);
  lines.push('');

  if (
    inputs['utilityCosts'] ??
    inputs['municipalCharges'] ??
    inputs['taxFees'] ??
    inputs['subleasePermission'] ??
    inputs['latePaymentPenalty'] ??
    inputs['lateVacatePenalty']
  ) {
    lines.push('───────────────────────────────────────────────');
    lines.push('تعهدات و شرایط');
    lines.push('───────────────────────────────────────────────');
    if (inputs['utilityCosts']) {
      lines.push(`  هزینه انشعابات: ${inputs['utilityCosts']}`);
    }
    if (inputs['municipalCharges']) {
      lines.push(`  عوارض شهرداری: ${inputs['municipalCharges']}`);
    }
    if (inputs['taxFees']) {
      lines.push(`  مالیات و عوارض: ${inputs['taxFees']}`);
    }
    if (inputs['subleasePermission']) {
      lines.push(`  اجاره مجدد: ${inputs['subleasePermission']}`);
    }
    if (inputs['latePaymentPenalty']) {
      lines.push(`  جریمه تأخیر پرداخت: ${inputs['latePaymentPenalty']}`);
    }
    if (inputs['lateVacatePenalty']) {
      lines.push(`  جریمه تأخیر تخلیه: ${inputs['lateVacatePenalty']}`);
    }
    lines.push('');
  }

  lines.push('───────────────────────────────────────────────');
  lines.push('بندهای قرارداد');
  lines.push('───────────────────────────────────────────────');
  lines.push('');

  const allClauses = [...template.clauses, ...template.optionalClauses];
  let clauseNum = 1;
  for (const clause of allClauses) {
    if (selectedClauses.includes(clause.id)) {
      lines.push(`ماده ${toPersianDigits(String(clauseNum))} - ${clause.title}:`);
      lines.push(clause.text);
      lines.push('');
      clauseNum++;
    }
  }

  if (inputs['witness1'] ?? inputs['witness2']) {
    lines.push('───────────────────────────────────────────────');
    lines.push('شاهدان');
    lines.push('───────────────────────────────────────────────');
    if (inputs['witness1']) {
      lines.push(`  شاهد اول: ${inputs['witness1']}`);
    }
    if (inputs['witness2']) {
      lines.push(`  شاهد دوم: ${inputs['witness2']}`);
    }
    lines.push('');
  }

  lines.push('───────────────────────────────────────────────');
  lines.push('امضاها');
  lines.push('───────────────────────────────────────────────');
  lines.push('');
  lines.push('امضای موجر:                    امضای مستأجر:');
  lines.push('_______________                 _______________');
  lines.push('');
  lines.push('تاریخ:                          تاریخ:');
  lines.push('_______________                 _______________');
  lines.push('');

  lines.push('═══════════════════════════════════════════════');
  lines.push(DISCLAIMER);
  lines.push('═══════════════════════════════════════════════');

  return lines.join('\n');
}

export function renderConstructionContractor(
  template: ContractTemplate,
  inputs: Record<string, string>,
  selectedClauses: string[],
  includeWatermark: boolean,
): string {
  const g = groupInputs(inputs);

  const lines: string[] = [];
  lines.push('═══════════════════════════════════════════════');
  if (includeWatermark) {
    lines.push(`⚠ ${DRAFT_WATERMARK}`);
    lines.push('');
  }
  lines.push('    قرارداد پیمانکاری / معماری ساختمان');
  lines.push('═══════════════════════════════════════════════');
  lines.push('');
  lines.push(`تاریخ تنظیم: ${formatDate(inputs['startDate'] ?? '')}`);
  lines.push('');

  lines.push('───────────────────────────────────────────────');
  lines.push('مشخصات طرفین قرارداد');
  lines.push('───────────────────────────────────────────────');
  lines.push('');
  lines.push('کارفرما:');
  const client = g['client'] ?? {};
  lines.push(`  نام: ${client['name'] ?? '________'}`);
  lines.push(`  کد ملی/شماره ثبت: ${toPersianDigits(client['nationalId'] ?? '________')}`);
  lines.push(`  تلفن: ${toPersianDigits(client['phone'] ?? '________')}`);
  lines.push(`  آدرس: ${client['address'] ?? '________'}`);
  lines.push('');
  lines.push('پیمانکار / معمار:');
  const contractor = g['contractor'] ?? {};
  lines.push(`  نام: ${contractor['name'] ?? '________'}`);
  lines.push(`  کد ملی/شماره ثبت: ${toPersianDigits(contractor['nationalId'] ?? '________')}`);
  lines.push(`  تلفن: ${toPersianDigits(contractor['phone'] ?? '________')}`);
  lines.push(`  آدرس: ${contractor['address'] ?? '________'}`);
  lines.push('');

  lines.push('───────────────────────────────────────────────');
  lines.push('موضوع قرارداد');
  lines.push('───────────────────────────────────────────────');
  lines.push(`  عنوان پروژه: ${inputs['projectTitle'] ?? '________'}`);
  lines.push(`  آدرس پروژه: ${inputs['projectAddress'] ?? '________'}`);
  lines.push(`  شرح خدمات: ${inputs['scopeOfWork'] ?? '________'}`);
  lines.push(`  تحویل‌ها: ${inputs['deliverables'] ?? '________'}`);
  if (inputs['milestones']) {
    lines.push(`  مراحل کار: ${inputs['milestones']}`);
  }
  lines.push('');

  lines.push('───────────────────────────────────────────────');
  lines.push('تاریخ‌ها و مبالغ');
  lines.push('───────────────────────────────────────────────');
  lines.push(`  تاریخ شروع: ${formatDate(inputs['startDate'] ?? '')}`);
  lines.push(`  تاریخ پایان: ${formatDate(inputs['endDate'] ?? '')}`);
  lines.push(`  مبلغ قرارداد: ${toPersianDigits(inputs['contractAmount'] ?? '________')} تومان`);
  lines.push(`  ساختار پرداخت: ${inputs['paymentStructure'] ?? '________'}`);
  if (inputs['advancePayment']) {
    lines.push(`  پیش‌پرداخت: ${toPersianDigits(inputs['advancePayment'])} تومان`);
  }
  lines.push('');

  const obligationFields = [
    'delayPenalty',
    'changeOrderRule',
    'confidentiality',
    'ipOwnership',
    'permitResponsibility',
    'insurance',
    'handoverConditions',
    'terminationConditions',
    'disputeResolution',
  ];
  const hasObligations = obligationFields.some((f) => inputs[f]);
  if (hasObligations) {
    lines.push('───────────────────────────────────────────────');
    lines.push('تعهدات و شرایط');
    lines.push('───────────────────────────────────────────────');
    const labels: Record<string, string> = {
      delayPenalty: 'جریمه تأخیر',
      changeOrderRule: 'تغییرات و الحاقیه',
      confidentiality: 'محرمانگی',
      ipOwnership: 'مالکیت نقشه‌ها',
      permitResponsibility: 'مسئولیت مجوزها',
      insurance: 'بیمه و مسئولیت',
      handoverConditions: 'شرایط تحویل نهایی',
      terminationConditions: 'شرایط فسخ',
      disputeResolution: 'حل اختلاف',
    };
    for (const f of obligationFields) {
      if (inputs[f]) {
        lines.push(`  ${labels[f]}: ${inputs[f]}`);
      }
    }
    lines.push('');
  }

  lines.push('───────────────────────────────────────────────');
  lines.push('بندهای قرارداد');
  lines.push('───────────────────────────────────────────────');
  lines.push('');

  let clauseNum = 1;
  for (const clause of [...template.clauses, ...template.optionalClauses]) {
    if (selectedClauses.includes(clause.id)) {
      lines.push(`ماده ${toPersianDigits(String(clauseNum))} - ${clause.title}:`);
      lines.push(clause.text);
      lines.push('');
      clauseNum++;
    }
  }

  if (inputs['witness1'] ?? inputs['witness2']) {
    lines.push('───────────────────────────────────────────────');
    lines.push('شاهدان');
    lines.push('───────────────────────────────────────────────');
    if (inputs['witness1']) {
      lines.push(`  شاهد اول: ${inputs['witness1']}`);
    }
    if (inputs['witness2']) {
      lines.push(`  شاهد دوم: ${inputs['witness2']}`);
    }
    lines.push('');
  }

  lines.push('───────────────────────────────────────────────');
  lines.push('امضاها');
  lines.push('───────────────────────────────────────────────');
  lines.push('');
  lines.push('امضای کارفرما:                 امضای پیمانکار:');
  lines.push('_______________                 _______________');
  lines.push('');
  lines.push('تاریخ:                          تاریخ:');
  lines.push('_______________                 _______________');
  lines.push('');

  lines.push('═══════════════════════════════════════════════');
  lines.push(DISCLAIMER);
  lines.push('═══════════════════════════════════════════════');

  return lines.join('\n');
}

export function renderContract(
  templateId: string,
  template: ContractTemplate,
  inputs: Record<string, string>,
  selectedClauses: string[],
  includeWatermark: boolean,
): string {
  switch (templateId) {
    case 'rental-lease':
      return renderRentalLease(template, inputs, selectedClauses, includeWatermark);
    case 'construction-contractor':
      return renderConstructionContractor(template, inputs, selectedClauses, includeWatermark);
    default:
      return 'قالب پشتیبانی نمی‌شود.';
  }
}

export async function hashText(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
