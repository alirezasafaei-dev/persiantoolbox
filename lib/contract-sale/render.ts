import type { SaleAgreementData } from './types';
import { DISCLAIMER, WATERMARK_TEXT } from './types';
import { formatDate, numberToWords } from './calculations';
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

export function renderSaleAgreement(
  data: SaleAgreementData,
  options: { watermark?: boolean; premiumClauses?: string[] },
): string {
  const contractNo = `SA-${Date.now().toString(36).toUpperCase()}`;
  const priceInWords = numberToWords(data.salePrice);
  const depositInWords = numberToWords(data.depositAmount);

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

  const sellerSignatureHtml = data.signatureSeller
    ? `<img src="${escapeHtml(data.signatureSeller)}" alt="امضای فروشنده" />`
    : '<div class="signature-line"></div>';

  const buyerSignatureHtml = data.signatureBuyer
    ? `<img src="${escapeHtml(data.signatureBuyer)}" alt="امضای خریدار" />`
    : '<div class="signature-line"></div>';

  const watermarkOverlay =
    options.watermark !== false ? `<div class="watermark">${escapeHtml(WATERMARK_TEXT)}</div>` : '';

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>مبایعه‌نامه ملک</title>
<style>${getBaseStyles()}</style>
</head>
<body>
${watermarkOverlay}
<div class="container">
  <div class="header">
    <h1>مبایعه‌نامه</h1>
    <div class="subtitle">این مبایعه‌نامه در تاریخ ${formatDate(data.contractDate)} بین طرفین زیر منعقد گردید</div>
  </div>
  <div class="contract-number">شماره قرارداد: ${contractNo}</div>

  <div class="section">
    <h2>طرفین قرارداد</h2>
    <div class="field-row"><span class="field-label">فروشنده:</span><span class="field-value">${escapeHtml(data.sellerName)}</span></div>
    <div class="field-row"><span class="field-label">کد ملی:</span><span class="field-value">${escapeHtml(data.sellerNationalId)}</span></div>
    <div class="field-row"><span class="field-label">تلفن:</span><span class="field-value">${escapeHtml(data.sellerPhone)}</span></div>
    <div class="field-row"><span class="field-label">آدرس:</span><span class="field-value">${escapeHtml(data.sellerAddress)}</span></div>
    <div style="margin-top:12px;"></div>
    <div class="field-row"><span class="field-label">خریدار:</span><span class="field-value">${escapeHtml(data.buyerName)}</span></div>
    <div class="field-row"><span class="field-label">کد ملی:</span><span class="field-value">${escapeHtml(data.buyerNationalId)}</span></div>
    <div class="field-row"><span class="field-label">تلفن:</span><span class="field-value">${escapeHtml(data.buyerPhone)}</span></div>
    <div class="field-row"><span class="field-label">آدرس:</span><span class="field-value">${escapeHtml(data.buyerAddress)}</span></div>
  </div>

  <div class="section">
    <h2>مشخصات ملک</h2>
    <div class="field-row"><span class="field-label">آدرس:</span><span class="field-value">${escapeHtml(data.propertyAddress)}</span></div>
    ${data.propertyParcelId ? `<div class="field-row"><span class="field-label">پلاک ثبتی:</span><span class="field-value">${escapeHtml(data.propertyParcelId)}</span></div>` : ''}
    <div class="field-row"><span class="field-label">متراژ:</span><span class="field-value">${escapeHtml(data.propertyArea)} متر مربع</span></div>
    <div class="field-row"><span class="field-label">شماره سند:</span><span class="field-value">${escapeHtml(data.propertyDeedNo ?? '---')}</span></div>
    <div class="field-row"><span class="field-label">شماره ثبت:</span><span class="field-value">${escapeHtml(data.propertyRegistryNo ?? '---')}</span></div>
  </div>

  <div class="section">
    <h2>مبلغ و نحوه پرداخت</h2>
    <div class="field-row"><span class="field-label">قیمت کل:</span><span class="field-value">${escapeHtml(data.salePrice)} ریال (${escapeHtml(priceInWords)} ریال)</span></div>
    <div class="field-row"><span class="field-label">بیعانه:</span><span class="field-value">${escapeHtml(data.depositAmount)} ریال (${escapeHtml(depositInWords)} ریال)</span></div>
    <div class="field-row"><span class="field-label">روش پرداخت:</span><span class="field-value">${escapeHtml(data.paymentMethod)}</span></div>
  </div>

  <div class="section">
    <h2>زمان‌بندی</h2>
    <div class="field-row"><span class="field-label">تاریخ تحویل:</span><span class="field-value">${formatDate(data.deliveryDate)}</span></div>
    <div class="field-row"><span class="field-label">تاریخ تصرف:</span><span class="field-value">${formatDate(data.possessionDate)}</span></div>
  </div>

  ${data.description ? `<div class="section"><h2>توضیحات</h2><p style="font-size:13px;color:#475569;">${escapeHtml(data.description)}</p></div>` : ''}

  <div class="section">
    <h2>شرایط و بندهای قرارداد</h2>
    ${clausesHtml}
  </div>

  <div class="signatures">
    <div class="signature-box">
      <h3>فروشنده</h3>
      ${sellerSignatureHtml}
      <div class="signature-label">${escapeHtml(data.sellerName)}</div>
    </div>
    <div class="signature-box">
      <h3>خریدار</h3>
      ${buyerSignatureHtml}
      <div class="signature-label">${escapeHtml(data.buyerName)}</div>
    </div>
  </div>

  <div class="disclaimer">${escapeHtml(DISCLAIMER)}</div>
</div>
</body>
</html>`;
}
