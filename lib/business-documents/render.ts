import type { BusinessDocumentDraft, BusinessDocumentTotals } from './types';
import { DISCLAIMER, WATERMARK_TEXT } from './types';
import { toPersianDigits, formatCurrency, toJalali, getDocumentTitle } from './calculations';
import { getThemeById } from './themes';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function partyBlock(
  party: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    nationalId?: string;
    registrationNo?: string;
    economicCode?: string;
  },
  label: string,
): string {
  const lines: string[] = [escapeHtml(label)];
  lines.push(`<strong>${escapeHtml(party.name)}</strong>`);
  if (party.nationalId) {
    lines.push(`کد ملی: ${toPersianDigits(party.nationalId)}`);
  }
  if (party.registrationNo) {
    lines.push(`شماره ثبت: ${toPersianDigits(party.registrationNo)}`);
  }
  if (party.economicCode) {
    lines.push(`کد اقتصادی: ${toPersianDigits(party.economicCode)}`);
  }
  if (party.phone) {
    lines.push(`تلفن: ${toPersianDigits(party.phone)}`);
  }
  if (party.email) {
    lines.push(`ایمیل: ${escapeHtml(party.email)}`);
  }
  if (party.address) {
    lines.push(`آدرس: ${escapeHtml(party.address)}`);
  }
  return lines.join('<br/>');
}

export function renderDocument(
  draft: BusinessDocumentDraft,
  totals: BusinessDocumentTotals,
  options: { watermark?: boolean; rtl?: boolean; theme?: string },
): string {
  const theme = getThemeById(options.theme ?? 'classic');
  const docTitle = getDocumentTitle(draft.documentType);
  const docNumber = draft.documentNumber ?? '';
  const docDate = draft.documentDate
    ? toJalali(new Date(draft.documentDate))
    : toJalali(new Date());

  const itemRows = draft.items
    .map((item, idx) => {
      const total = item.quantity * item.unitPrice;
      return `<tr>
        <td style="padding:8px 12px;border:1px solid ${theme.colors.border};text-align:center;">${toPersianDigits(String(idx + 1))}</td>
        <td style="padding:8px 12px;border:1px solid ${theme.colors.border};">${escapeHtml(item.description)}</td>
        <td style="padding:8px 12px;border:1px solid ${theme.colors.border};text-align:center;">${item.unit ? escapeHtml(item.unit) : '-'}</td>
        <td style="padding:8px 12px;border:1px solid ${theme.colors.border};text-align:center;">${toPersianDigits(String(item.quantity))}</td>
        <td style="padding:8px 12px;border:1px solid ${theme.colors.border};text-align:center;">${formatCurrency(item.unitPrice)}</td>
        <td style="padding:8px 12px;border:1px solid ${theme.colors.border};text-align:center;">${formatCurrency(total)}</td>
      </tr>`;
    })
    .join('\n');

  const discountRow =
    totals.discountAmount > 0
      ? `<tr>
        <td colspan="5" style="padding:8px 12px;border:1px solid ${theme.colors.border};text-align:left;font-weight:bold;">تخفیف</td>
        <td style="padding:8px 12px;border:1px solid ${theme.colors.border};text-align:center;color:${theme.colors.discount};">-${formatCurrency(totals.discountAmount)}</td>
      </tr>`
      : '';

  const taxRow =
    totals.taxAmount > 0
      ? `<tr>
        <td colspan="5" style="padding:8px 12px;border:1px solid ${theme.colors.border};text-align:left;font-weight:bold;">مالیات</td>
        <td style="padding:8px 12px;border:1px solid ${theme.colors.border};text-align:center;">${formatCurrency(totals.taxAmount)}</td>
      </tr>`
      : '';

  const notesSection = draft.notes
    ? `<div style="margin-top:24px;">
        <h3 style="margin:0 0 8px 0;color:#1e293b;font-size:14px;">توضیحات</h3>
        <p style="margin:0;color:#475569;font-size:13px;white-space:pre-wrap;">${escapeHtml(draft.notes)}</p>
      </div>`
    : '';

  const footerSection = draft.footer
    ? `<div style="margin-top:16px;padding:12px;background:#f8fafc;border-radius:6px;text-align:center;color:#64748b;font-size:12px;">
        ${escapeHtml(draft.footer)}
      </div>`
    : '';

  const watermarkOverlay = options.watermark
    ? `<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-45deg);font-size:48px;color:rgba(220,38,38,0.08);font-weight:bold;pointer-events:none;z-index:1000;">
        ${escapeHtml(WATERMARK_TEXT)}
      </div>`
    : '';

  const logoSection = draft.logoDataUrl
    ? `<img src="${escapeHtml(draft.logoDataUrl)}" style="max-height:60px;max-width:180px;object-fit:contain;" alt="لوگو" />`
    : '';

  return `<!DOCTYPE html>
<html lang="fa" dir="${options.rtl !== false ? 'rtl' : 'ltr'}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(docTitle)} ${toPersianDigits(docNumber)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Vazirmatn', 'Tahoma', 'Arial', sans-serif;
    direction: rtl;
    background: ${theme.colors.background};
    color: ${theme.colors.text};
    line-height: 1.6;
  }
  .container {
    max-width: 800px;
    margin: 20px auto;
    background: ${theme.colors.surface};
    padding: 32px;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  .header {
    text-align: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid ${theme.colors.primary};
  }
  .header h1 {
    font-size: 22px;
    color: ${theme.colors.primary};
    margin-bottom: 8px;
  }
  .meta {
    font-size: 13px;
    color: ${theme.colors.textSecondary};
  }
  .parties {
    display: flex;
    gap: 24px;
    margin: 20px 0;
  }
  .party-box {
    flex: 1;
    padding: 16px;
    background: ${theme.colors.surface};
    border-radius: 8px;
    border: 1px solid ${theme.colors.border};
    font-size: 13px;
    line-height: 1.8;
  }
  .party-box strong {
    display: block;
    font-size: 14px;
    margin-bottom: 4px;
    color: ${theme.colors.text};
  }
  .items-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 13px;
  }
  .items-table thead th {
    background: ${theme.colors.headerBg};
    color: ${theme.colors.headerText};
    padding: 10px 12px;
    font-weight: 600;
    text-align: center;
  }
  .totals-box {
    margin-left: 0;
    margin-bottom: 20px;
  }
  .totals-box table {
    width: 300px;
    margin-left: 0;
    margin-right: auto;
    border-collapse: collapse;
    font-size: 13px;
  }
  .totals-box td {
    padding: 8px 12px;
    border: 1px solid ${theme.colors.border};
  }
  .totals-box .grand-total td {
    background: ${theme.colors.headerBg};
    color: ${theme.colors.headerText};
    font-weight: 700;
    font-size: 15px;
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
    body { background: ${theme.colors.surface}; }
    .container { box-shadow: none; margin: 0; padding: 20px; max-width: 100%; }
  }
</style>
</head>
<body>
${watermarkOverlay}
<div class="container">
  <div class="header">
    ${logoSection}
    <h1>${escapeHtml(docTitle)}</h1>
    <div class="meta">
      شماره: ${toPersianDigits(docNumber)}${docDate ? ` | تاریخ: ${docDate}` : ''}
    </div>
  </div>

  <div class="parties">
    <div class="party-box">
      ${partyBlock(draft.seller, draft.documentType === 'receipt' ? 'دریافت‌کننده' : 'فروشنده')}
    </div>
    <div class="party-box">
      ${partyBlock(draft.buyer, draft.documentType === 'receipt' ? 'پرداخت‌کننده' : 'خریدار')}
    </div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th style="width:50px;">ردیف</th>
        <th>شرح</th>
        <th style="width:70px;">واحد</th>
        <th style="width:70px;">تعداد</th>
        <th style="width:120px;">قیمت واحد</th>
        <th style="width:120px;">جمع</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <div class="totals-box">
    <table>
      <tr>
        <td style="font-weight:600;">جمع کل</td>
        <td style="text-align:center;">${formatCurrency(totals.subtotal)}</td>
      </tr>
      ${discountRow}
      ${taxRow}
      <tr class="grand-total">
        <td>مبلغ قابل پرداخت</td>
        <td style="text-align:center;">${formatCurrency(totals.grandTotal)}</td>
      </tr>
    </table>
  </div>

  ${notesSection}
  ${footerSection}

  <div class="disclaimer">
    ${escapeHtml(DISCLAIMER)}
  </div>
</div>
</body>
</html>`;
}
