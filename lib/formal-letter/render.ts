import type { FormalLetterData } from './types';
import { DISCLAIMER, WATERMARK_TEXT, LETTER_TYPE_LABELS } from './types';
import { formatDate } from './calculations';
import { STANDARD_PARAGRAPHS, PREMIUM_PARAGRAPHS } from './paragraphs';

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
  .letterhead {
    text-align: center;
    padding-bottom: 20px;
    border-bottom: 3px double #cbd5e1;
    margin-bottom: 24px;
  }
  .letterhead h1 {
    font-size: 18px;
    color: #1e3a5f;
    margin-bottom: 4px;
  }
  .letterhead .letter-type {
    font-size: 13px;
    color: #64748b;
  }
  .ref-line {
    text-align: left;
    font-size: 12px;
    color: #64748b;
    margin-bottom: 16px;
  }
  .meta-table {
    width: 100%;
    margin-bottom: 20px;
  }
  .meta-table td {
    padding: 4px 8px;
    font-size: 13px;
    vertical-align: top;
  }
  .meta-table td.label {
    width: 20%;
    font-weight: 600;
    color: #475569;
    white-space: nowrap;
  }
  .meta-table td.value {
    width: 30%;
    color: #1e293b;
  }
  .subject-line {
    font-size: 15px;
    font-weight: 600;
    color: #1e3a5f;
    margin-bottom: 20px;
    padding: 8px 12px;
    background: #f1f5f9;
    border-radius: 6px;
    border-right: 3px solid #2563eb;
  }
  .body-text {
    font-size: 14px;
    line-height: 2.2;
    margin-bottom: 24px;
    white-space: pre-wrap;
  }
  .body-text p {
    margin-bottom: 10px;
  }
  .closing-text {
    margin-top: 24px;
    font-size: 14px;
    line-height: 2;
  }
  .signature-area {
    margin-top: 40px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .signature-box {
    text-align: center;
    width: 200px;
  }
  .signature-box .name {
    font-weight: 600;
    color: #1e3a5f;
    font-size: 14px;
  }
  .signature-box .position {
    font-size: 12px;
    color: #64748b;
    margin-bottom: 4px;
  }
  .signature-line {
    width: 160px;
    height: 1px;
    border-top: 2px solid #475569;
    margin: 10px auto 4px;
  }
  .signature-box img {
    display: block;
    max-height: 40px;
    margin: 0 auto 8px;
  }
  .signature-label {
    font-size: 11px;
    color: #64748b;
  }
  .enclosure-line {
    margin-top: 20px;
    padding-top: 12px;
    border-top: 1px solid #e2e8f0;
    font-size: 12px;
    color: #64748b;
  }
  .cc-line {
    margin-top: 8px;
    font-size: 12px;
    color: #64748b;
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

export function renderLetter(
  data: FormalLetterData,
  options: { watermark?: boolean; premiumParagraphs?: string[] },
): string {
  const letterNo = data.referenceNumber ?? `LTR-${Date.now().toString(36).toUpperCase()}`;

  const allParagraphs = [...STANDARD_PARAGRAPHS];
  if (options.premiumParagraphs) {
    for (const paraId of options.premiumParagraphs) {
      const premiumPara = PREMIUM_PARAGRAPHS.find((p) => p.id === paraId);
      if (premiumPara) {
        allParagraphs.push({ ...premiumPara, defaultEnabled: true });
      }
    }
  }

  if (data.additionalParagraphs.length > 0) {
    data.additionalParagraphs.forEach((text, i) => {
      if (text.trim()) {
        allParagraphs.push({
          id: `custom-${i}`,
          title: `بند ${i + 1}`,
          text: text.trim(),
          defaultEnabled: true,
          applicableTypes: [
            'request',
            'complaint',
            'inquiry',
            'introduction',
            'notification',
            'cover-letter',
          ],
        });
      }
    });
  }

  const paragraphHtml = allParagraphs
    .filter((p) => p.defaultEnabled && p.applicableTypes.includes(data.letterType))
    .map((p) => `<p>${escapeHtml(p.text)}</p>`)
    .join('');

  const signatureHtml = data.signatureDataUrl
    ? `<img src="${escapeHtml(data.signatureDataUrl)}" alt="امضا" />`
    : '<div class="signature-line"></div>';

  const watermarkOverlay =
    options.watermark !== false ? `<div class="watermark">${escapeHtml(WATERMARK_TEXT)}</div>` : '';

  const enclosureHtml = data.enclosures?.trim()
    ? `<div class="enclosure-line"><strong>پیوست‌ها:</strong> ${escapeHtml(data.enclosures)}</div>`
    : '';

  const ccHtml = data.ccList?.trim()
    ? `<div class="cc-line"><strong>رونوشت:</strong> ${escapeHtml(data.ccList)}</div>`
    : '';

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(data.subject)}</title>
<style>${getBaseStyles()}</style>
</head>
<body>
${watermarkOverlay}
<div class="container">
  <div class="letterhead">
    <h1>${data.senderOrganization ? escapeHtml(data.senderOrganization) : 'نامه اداری'}</h1>
    <div class="letter-type">${LETTER_TYPE_LABELS[data.letterType]}</div>
  </div>

  ${data.referenceNumber ? `<div class="ref-line">شماره: ${escapeHtml(data.referenceNumber)}</div>` : ''}

  <table class="meta-table">
    <tr><td class="label">تاریخ:</td><td class="value">${formatDate(data.letterDate)}</td>
        <td class="label">شماره:</td><td class="value">${letterNo}</td></tr>
    <tr><td class="label">فرستنده:</td><td class="value" colspan="3">${escapeHtml(data.senderName)}${data.senderPosition ? ` — ${escapeHtml(data.senderPosition)}` : ''}</td></tr>
    <tr><td class="label">گیرنده:</td><td class="value" colspan="3">${escapeHtml(data.recipientName)}${data.recipientPosition ? ` — ${escapeHtml(data.recipientPosition)}` : ''}</td></tr>
  </table>

  <div class="subject-line">موضوع: ${escapeHtml(data.subject)}</div>

  <div class="body-text">
    <p>${escapeHtml(data.salutation)}</p>
    ${paragraphHtml}
    <p>${escapeHtml(data.body)}</p>
  </div>

  <div class="closing-text">
    <p>${escapeHtml(data.closing)}</p>
  </div>

  <div class="signature-area">
    <div></div>
    <div class="signature-box">
      <div class="position">${escapeHtml(data.senderPosition ?? '')}</div>
      <div class="name">${escapeHtml(data.senderName)}</div>
      ${signatureHtml}
      <div class="signature-label">امضا</div>
    </div>
  </div>

  ${enclosureHtml}
  ${ccHtml}

  <div class="disclaimer">${escapeHtml(DISCLAIMER)}</div>
</div>
</body>
</html>`;
}
