import type { LeaseData } from './types';
import { DISCLAIMER, WATERMARK_TEXT } from './types';
import { formatDate, toPersianDigits } from './calculations';
import { STANDARD_CLAUSES, PREMIUM_CLAUSES } from './clauses';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getBaseStyles(): string {
  return `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Vazirmatn', 'Tahoma', 'Arial', sans-serif;
    direction: rtl;
    background: #f8fafc;
    color: #1e293b;
    line-height: 2.2;
    font-size: 14px;
  }
  .container {
    max-width: 800px;
    margin: 30px auto;
    background: #ffffff;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  }
  .header {
    text-align: center;
    padding-bottom: 24px;
    border-bottom: 3px double #cbd5e1;
    margin-bottom: 28px;
  }
  .header h1 {
    font-size: 22px;
    color: #1e3a5f;
    margin-bottom: 8px;
  }
  .header .subtitle {
    font-size: 13px;
    color: #64748b;
  }
  .contract-number {
    text-align: left;
    font-size: 12px;
    color: #64748b;
    margin-bottom: 20px;
  }
  .section {
    margin-bottom: 24px;
  }
  .section h2 {
    font-size: 16px;
    color: #1e3a5f;
    margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 1px solid #e2e8f0;
  }
  .field-row {
    display: flex;
    margin-bottom: 8px;
  }
  .field-label {
    width: 35%;
    font-weight: 600;
    color: #475569;
    font-size: 13px;
  }
  .field-value {
    width: 65%;
    color: #1e293b;
    font-size: 13px;
  }
  .clause {
    margin-bottom: 16px;
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
    border-right: 3px solid #2563eb;
  }
  .clause h3 {
    font-size: 14px;
    color: #1e3a5f;
    margin-bottom: 6px;
  }
  .clause p {
    font-size: 13px;
    line-height: 2;
    color: #475569;
  }
  .signatures {
    display: flex;
    justify-content: space-between;
    margin-top: 32px;
    padding-top: 20px;
    border-top: 1px solid #e2e8f0;
  }
  .signature-box {
    width: 45%;
  }
  .signature-box h3 {
    font-size: 14px;
    color: #1e3a5f;
    margin-bottom: 8px;
    text-align: center;
  }
  .signature-line {
    height: 1px;
    border-top: 2px solid #475569;
    margin: 40px auto 8px;
    width: 80%;
  }
  .signature-label {
    font-size: 11px;
    color: #64748b;
    text-align: center;
  }
  .signature-box img {
    display: block;
    max-height: 40px;
    margin: 0 auto 8px;
  }
  .watermark {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-35deg);
    font-size: 36px;
    color: rgba(220, 38, 38, 0.07);
    font-weight: bold;
    pointer-events: none;
    z-index: 1000;
  }
  .disclaimer {
    margin-top: 24px;
    padding: 12px;
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 8px;
    font-size: 11px;
    color: #92400e;
    line-height: 1.8;
  }
  @media print {
    body { background: white; }
    .container { box-shadow: none; margin: 0; padding: 20px; max-width: 100%; }
    .watermark { display: none; }
  }`;
}

export function renderLease(
  data: LeaseData,
  options: { watermark?: boolean; premiumClauses?: string[] },
): string {
  const contractNo = `RL-${Date.now().toString(36).toUpperCase()}`;

  const allClauses = [...STANDARD_CLAUSES];
  if (options.premiumClauses) {
    for (const clauseId of options.premiumClauses) {
      const premiumClause = PREMIUM_CLAUSES.find((c) => c.id === clauseId);
      if (premiumClause) {
        allClauses.push({ ...premiumClause, defaultEnabled: true });
      }
    }
  }

  if (data.additionalClauses.length > 0) {
    data.additionalClauses.forEach((text, i) => {
      if (text.trim()) {
        allClauses.push({
          id: `custom-${i}`,
          title: `شرط ${i + 1}`,
          text: text.trim(),
          defaultEnabled: true,
        });
      }
    });
  }

  const clausesHtml = allClauses
    .filter((c) => c.defaultEnabled)
    .map(
      (c) => `
    <div class="clause">
      <h3>${escapeHtml(c.title)}</h3>
      <p>${escapeHtml(c.text)}</p>
    </div>`,
    )
    .join('');

  const landlordSignatureHtml = data.landlordSignature
    ? `<img src="${escapeHtml(data.landlordSignature)}" alt="امضای موجر" />`
    : '<div class="signature-line"></div>';

  const tenantSignatureHtml = data.tenantSignature
    ? `<img src="${escapeHtml(data.tenantSignature)}" alt="امضای مستأجر" />`
    : '<div class="signature-line"></div>';

  const watermarkOverlay =
    options.watermark !== false ? `<div class="watermark">${escapeHtml(WATERMARK_TEXT)}</div>` : '';

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>اجاره‌نامه مسکونی</title>
<style>${getBaseStyles()}</style>
</head>
<body>
${watermarkOverlay}
<div class="container">
  <div class="header">
    <h1>اجاره‌نامه</h1>
    <div class="subtitle">این اجاره‌نامه در تاریخ ${formatDate(getCurrentDate())} بین طرفین زیر منعقد گردید</div>
  </div>
  <div class="contract-number">شماره قرارداد: ${contractNo}</div>

  <div class="section">
    <h2>طرفین قرارداد</h2>
    <div class="field-row"><span class="field-label">موجر (مالک):</span><span class="field-value">${escapeHtml(data.landlordName)}</span></div>
    <div class="field-row"><span class="field-label">کد ملی:</span><span class="field-value">${escapeHtml(data.landlordNationalId)}</span></div>
    <div class="field-row"><span class="field-label">تلفن:</span><span class="field-value">${escapeHtml(data.landlordPhone)}</span></div>
    <div class="field-row"><span class="field-label">آدرس:</span><span class="field-value">${escapeHtml(data.landlordAddress)}</span></div>
    <div style="margin-top:12px;"></div>
    <div class="field-row"><span class="field-label">مستأجر:</span><span class="field-value">${escapeHtml(data.tenantName)}</span></div>
    <div class="field-row"><span class="field-label">کد ملی:</span><span class="field-value">${escapeHtml(data.tenantNationalId)}</span></div>
    <div class="field-row"><span class="field-label">تلفن:</span><span class="field-value">${escapeHtml(data.tenantPhone)}</span></div>
    <div class="field-row"><span class="field-label">آدرس:</span><span class="field-value">${escapeHtml(data.tenantAddress)}</span></div>
  </div>

  <div class="section">
    <h2>مشخصات ملک</h2>
    <div class="field-row"><span class="field-label">آدرس:</span><span class="field-value">${escapeHtml(data.propertyAddress)}</span></div>
    ${data.propertyPostalCode ? `<div class="field-row"><span class="field-label">کد پستی:</span><span class="field-value">${escapeHtml(data.propertyPostalCode)}</span></div>` : ''}
    <div class="field-row"><span class="field-label">متراژ:</span><span class="field-value">${escapeHtml(data.propertyArea)} متر مربع</span></div>
    ${data.propertyFloor ? `<div class="field-row"><span class="field-label">طبقه:</span><span class="field-value">${escapeHtml(data.propertyFloor)}</span></div>` : ''}
    ${data.propertyUnit ? `<div class="field-row"><span class="field-label">واحد:</span><span class="field-value">${escapeHtml(data.propertyUnit)}</span></div>` : ''}
    ${data.propertyDeedType ? `<div class="field-row"><span class="field-label">نوع سند:</span><span class="field-value">${escapeHtml(data.propertyDeedType)}</span></div>` : ''}
    ${data.propertyUtilities ? `<div class="field-row"><span class="field-label">انشعابات:</span><span class="field-value">${escapeHtml(data.propertyUtilities)}</span></div>` : ''}
    ${data.propertyFixtures ? `<div class="field-row"><span class="field-label">لوازم:</span><span class="field-value">${escapeHtml(data.propertyFixtures)}</span></div>` : ''}
  </div>

  <div class="section">
    <h2>مدت و شرایط مالی</h2>
    <div class="field-row"><span class="field-label">تاریخ شروع اجاره:</span><span class="field-value">${formatDate(data.startDate)}</span></div>
    <div class="field-row"><span class="field-label">تاریخ پایان اجاره:</span><span class="field-value">${formatDate(data.endDate)}</span></div>
    <div class="field-row"><span class="field-label">تاریخ تحویل ملک:</span><span class="field-value">${formatDate(data.deliveryDate)}</span></div>
    <div class="field-row"><span class="field-label">مبلغ ودیعه:</span><span class="field-value">${toPersianDigits(data.depositAmount)} تومان</span></div>
    <div class="field-row"><span class="field-label">اجاره ماهانه:</span><span class="field-value">${toPersianDigits(data.monthlyRent)} تومان</span></div>
    <div class="field-row"><span class="field-label">روز پرداخت:</span><span class="field-value">${escapeHtml(data.paymentDay)}</span></div>
    <div class="field-row"><span class="field-label">روش پرداخت:</span><span class="field-value">${escapeHtml(data.paymentMethod)}</span></div>
  </div>

  ${
    (data.utilityCosts ??
    data.municipalCharges ??
    data.taxFees ??
    data.subleasePermission ??
    data.latePaymentPenalty ??
    data.lateVacatePenalty)
      ? `<div class="section">
    <h2>سایر شرایط</h2>
    ${data.utilityCosts ? `<div class="field-row"><span class="field-label">هزینه انشعابات:</span><span class="field-value">${escapeHtml(data.utilityCosts)}</span></div>` : ''}
    ${data.municipalCharges ? `<div class="field-row"><span class="field-label">عوارض شهرداری:</span><span class="field-value">${escapeHtml(data.municipalCharges)}</span></div>` : ''}
    ${data.taxFees ? `<div class="field-row"><span class="field-label">مالیات:</span><span class="field-value">${escapeHtml(data.taxFees)}</span></div>` : ''}
    ${data.subleasePermission ? `<div class="field-row"><span class="field-label">اجاره مجدد:</span><span class="field-value">${escapeHtml(data.subleasePermission)}</span></div>` : ''}
    ${data.latePaymentPenalty ? `<div class="field-row"><span class="field-label">جریمه تأخیر پرداخت:</span><span class="field-value">${escapeHtml(data.latePaymentPenalty)}</span></div>` : ''}
    ${data.lateVacatePenalty ? `<div class="field-row"><span class="field-label">جریمه تأخیر تخلیه:</span><span class="field-value">${escapeHtml(data.lateVacatePenalty)}</span></div>` : ''}
  </div>`
      : ''
  }

  ${data.description ? `<div class="section"><h2>توضیحات</h2><p style="font-size:13px;color:#475569;">${escapeHtml(data.description)}</p></div>` : ''}

  <div class="section">
    <h2>شرایط و بندهای قرارداد</h2>
    ${clausesHtml}
  </div>

  ${
    (data.witness1 ?? data.witness2)
      ? `<div class="section">
    <h2>شاهدان</h2>
    ${data.witness1 ? `<div class="field-row"><span class="field-label">شاهد اول:</span><span class="field-value">${escapeHtml(data.witness1)}</span></div>` : ''}
    ${data.witness2 ? `<div class="field-row"><span class="field-label">شاهد دوم:</span><span class="field-value">${escapeHtml(data.witness2)}</span></div>` : ''}
  </div>`
      : ''
  }

  <div class="signatures">
    <div class="signature-box">
      <h3>موجر (مالک)</h3>
      ${landlordSignatureHtml}
      <div class="signature-label">${escapeHtml(data.landlordName)}</div>
    </div>
    <div class="signature-box">
      <h3>مستأجر</h3>
      ${tenantSignatureHtml}
      <div class="signature-label">${escapeHtml(data.tenantName)}</div>
    </div>
  </div>

  <div class="disclaimer">${escapeHtml(DISCLAIMER)}</div>
</div>
</body>
</html>`;
}

function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0] ?? '';
}
