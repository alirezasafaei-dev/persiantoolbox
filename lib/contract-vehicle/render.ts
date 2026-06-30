import type { VehicleData } from './types';
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
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .title { text-align: center; font-size: 22px; font-weight: 900; color: #0f172a; margin-bottom: 8px; }
  .section-title { font-size: 16px; font-weight: 700; color: #1e3a5f; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin: 24px 0 12px; }
  .field { display: flex; gap: 8px; margin-bottom: 6px; font-size: 13px; }
  .field-label { font-weight: 700; min-width: 120px; }
  .field-value { color: #334155; }
  .clause { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 10px; font-size: 13px; }
  .clause-title { font-weight: 700; margin-bottom: 4px; }
  .clause-text { color: #475569; }
  .disclaimer { margin-top: 30px; padding: 12px; background: #fefce8; border: 1px solid #fde68a; border-radius: 8px; font-size: 11px; color: #92400e; }
  .watermark { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 16px; }
  .signature-area { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; }
  .signature-box { text-align: center; width: 40%; }
  .signature-line { border-top: 1px solid #94a3b8; padding-top: 8px; font-size: 12px; color: #64748b; }
  `;
}

export function renderVehicleContract(
  data: VehicleData,
  options: { watermark: boolean; selectedClauses?: string[] } = { watermark: true },
): string {
  const { watermark, selectedClauses = [] } = options;

  const standardClausesHtml = STANDARD_CLAUSES.map(
    (c) => `
    <div class="clause">
      <div class="clause-title">${escapeHtml(c.title)}</div>
      <div class="clause-text">${escapeHtml(c.text)}</div>
    </div>`,
  ).join('');

  const premiumClausesHtml = PREMIUM_CLAUSES.filter((c) => selectedClauses.includes(c.id))
    .map(
      (c) => `
    <div class="clause">
      <div class="clause-title">${escapeHtml(c.title)}</div>
      <div class="clause-text">${escapeHtml(c.text)}</div>
    </div>`,
    )
    .join('');

  const field = (label: string, value: string) =>
    `<div class="field"><span class="field-label">${escapeHtml(label)}:</span><span class="field-value">${escapeHtml(value)}</span></div>`;

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<title>مبایعه‌نامه خودرو</title>
<style>${getBaseStyles()}</style>
</head>
<body>
<div class="container">
  <div class="title">مبایعه‌نامه خودرو</div>

  <div class="section-title">فروشنده</div>
  ${field('نام', data.sellerName)}
  ${field('کد ملی', data.sellerNationalId)}
  ${field('تلفن', data.sellerPhone)}
  ${data.sellerAddress ? field('آدرس', data.sellerAddress) : ''}

  <div class="section-title">خریدار</div>
  ${field('نام', data.buyerName)}
  ${field('کد ملی', data.buyerNationalId)}
  ${field('تلفن', data.buyerPhone)}
  ${data.buyerAddress ? field('آدرس', data.buyerAddress) : ''}

  <div class="section-title">مشخصات خودرو</div>
  ${field('سازنده', data.vehicleMake)}
  ${field('مدل', data.vehicleModel)}
  ${field('سال ساخت', data.vehicleYear)}
  ${field('رنگ', data.vehicleColor)}
  ${field('شماره پلاک', data.plateNumber)}
  ${data.chassisNumber ? field('شماره شاسی', data.chassisNumber) : ''}
  ${data.engineNumber ? field('شماره موتور', data.engineNumber) : ''}
  ${data.mileage ? field('کارکرد', `${toPersianDigits(data.mileage)} کیلومتر`) : ''}
  ${data.vehicleType ? field('نوع خودرو', data.vehicleType) : ''}
  ${data.vehicleCondition ? field('وضعیت ظاهری', data.vehicleCondition) : ''}

  <div class="section-title">شرایط مالی</div>
  ${field('مبلغ فروش', `${toPersianDigits(data.salePrice)} تومان`)}
  ${field('روش پرداخت', data.paymentMethod)}
  ${data.paymentDate ? field('تاریخ پرداخت', formatDate(data.paymentDate)) : ''}
  ${field('تاریخ تحویل', formatDate(data.deliveryDate))}

  ${data.insuranceStatus ? `<div class="section-title">بیمه</div>${field('وضعیت بیمه', data.insuranceStatus)}` : ''}
  ${data.inspectionStatus ? `<div class="section-title">معاینه فنی</div>${field('وضعیت معاینه', data.inspectionStatus)}` : ''}

  <div class="section-title">بندهای قرارداد</div>
  ${standardClausesHtml}
  ${premiumClausesHtml}

  ${
    data.additionalClauses.length > 0
      ? `
  <div class="section-title">بندهای اضافی</div>
  ${data.additionalClauses.map((c, i) => `<div class="clause"><div class="clause-title">بند ${i + 1}</div><div class="clause-text">${escapeHtml(c)}</div></div>`).join('')}
  `
      : ''
  }

  ${data.description ? `<div class="section-title">توضیحات</div><div class="clause-text">${escapeHtml(data.description)}</div>` : ''}

  <div class="signature-area">
    <div class="signature-box"><div class="signature-line">امضای فروشنده</div></div>
    <div class="signature-box"><div class="signature-line">امضای خریدار</div></div>
  </div>

  ${data.witness1 ? `<div style="margin-top:20px;display:flex;justify-content:space-between;font-size:12px;color:#64748b"><span>گواه اول: ${escapeHtml(data.witness1)}</span><span>گواه دوم: ${escapeHtml(data.witness2 ?? '')}</span></div>` : ''}

  <div class="disclaimer">${escapeHtml(DISCLAIMER)}</div>
  ${watermark ? `<div class="watermark">${escapeHtml(WATERMARK_TEXT)}</div>` : ''}
</div>
</body>
</html>`;
}
