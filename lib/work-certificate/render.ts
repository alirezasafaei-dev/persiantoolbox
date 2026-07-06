import type { WorkCertificateData } from './types';
import { DISCLAIMER, WATERMARK_TEXT } from './types';
import { toPersianDigits, formatDate, formatDateEn } from './calculations';
import { getCertificateThemeById } from './themes';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getBaseStyles(theme: ReturnType<typeof getCertificateThemeById>): string {
  return `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Vazirmatn', 'Tahoma', 'Arial', sans-serif;
    direction: rtl;
    background: ${theme.colors.background};
    color: ${theme.colors.text};
    line-height: 2;
  }
  .container {
    max-width: 800px;
    margin: 30px auto;
    background: ${theme.colors.surface};
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.1);
    position: relative;
  }
  .header {
    text-align: center;
    padding-bottom: 20px;
    border-bottom: 3px double ${theme.colors.border};
    margin-bottom: 24px;
  }
  .header .seal {
    font-size: 32px;
    color: ${theme.colors.seal};
    margin-bottom: 8px;
  }
  .header h1 {
    font-size: 22px;
    color: ${theme.colors.primary};
    margin-bottom: 4px;
  }
  .header .subtitle {
    font-size: 13px;
    color: ${theme.colors.textSecondary};
  }
  .certificate-number {
    text-align: left;
    font-size: 12px;
    color: ${theme.colors.textSecondary};
    margin-bottom: 16px;
  }
  .body-text {
    font-size: 14px;
    line-height: 2.2;
    margin-bottom: 24px;
  }
  .body-text p {
    margin-bottom: 12px;
  }
  .info-table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
  }
  .info-table td {
    padding: 8px 12px;
    border: 1px solid ${theme.colors.border};
    font-size: 14px;
    vertical-align: top;
  }
  .info-table td.label {
    width: 35%;
    font-weight: 600;
    background: ${theme.colors.background};
    color: ${theme.colors.primary};
  }
  .info-table td.value {
    width: 65%;
    color: ${theme.colors.text};
  }
  .footer {
    margin-top: 32px;
    padding-top: 20px;
    border-top: 1px solid ${theme.colors.border};
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .footer .issuer {
    font-size: 14px;
  }
  .footer .issuer .name {
    font-weight: 600;
    color: ${theme.colors.primary};
  }
  .footer .issuer .position {
    font-size: 12px;
    color: ${theme.colors.textSecondary};
  }
  .footer .stamp-area {
    text-align: center;
    width: 140px;
  }
  .footer .stamp-area .stamp-circle {
    width: 100px;
    height: 100px;
    border: 3px solid ${theme.colors.seal};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 8px;
    font-size: 11px;
    color: ${theme.colors.seal};
    font-weight: bold;
    opacity: 0.5;
  }
  .footer .stamp-area .signature-line {
    width: 120px;
    height: 1px;
    border-top: 2px solid ${theme.colors.text};
    margin: 8px auto 4px;
  }
  .footer .stamp-area .signature-label {
    font-size: 10px;
    color: ${theme.colors.textSecondary};
  }
  .logo-area {
    text-align: center;
    margin-bottom: 12px;
  }
  .logo-area img {
    max-height: 60px;
    max-width: 200px;
    object-fit: contain;
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
  .bilingual-block {
    margin-top: 24px;
    padding: 20px;
    border-top: 2px dashed ${theme.colors.border};
  }
  .bilingual-block .en-section {
    direction: ltr;
    text-align: left;
    font-family: 'Inter', 'Helvetica Neue', 'Arial', sans-serif;
  }
  .bilingual-block .en-section h2 {
    font-size: 18px;
    color: ${theme.colors.primary};
    margin-bottom: 12px;
    text-align: center;
  }
  @media print {
    body { background: white; }
    .container { box-shadow: none; margin: 0; padding: 20px; max-width: 100%; }
    .watermark { display: none; }
  }`;
}

function renderBilingual(data: WorkCertificateData): string {
  let endPeriodText: string;
  if (data.isCurrent) {
    endPeriodText = 'to Present';
  } else if (data.endDate) {
    endPeriodText = `to ${formatDateEn(data.endDate)}`;
  } else {
    endPeriodText = '';
  }
  return `
  <div class="bilingual-block">
    <div class="en-section">
      <h2>Work Experience Certificate</h2>
      <p>This is to certify that <strong>${escapeHtml(data.employeeName)}</strong> 
      ${data.nationalId ? `(National ID: ${toPersianDigits(data.nationalId)})` : ''}
      was employed at <strong>${escapeHtml(data.employerName)}</strong> 
      ${data.department ? `in the <strong>${escapeHtml(data.department)}</strong> department` : ''}
      as <strong>${escapeHtml(data.position)}</strong>.</p>
      <p>Employment Period: ${formatDateEn(data.startDate)} ${endPeriodText}</p>
      ${data.description ? `<p>${escapeHtml(data.description)}</p>` : ''}
      <p style="margin-top:24px; text-align:right;">Issued by: ${escapeHtml(data.issuerName)}<br/>
      Position: ${escapeHtml(data.issuerPosition)}<br/>
      Date: ${formatDateEn(data.certificateDate)}</p>
    </div>
  </div>`;
}

export function renderCertificate(
  data: WorkCertificateData,
  options: { watermark?: boolean; templateId?: string },
): string {
  const theme = getCertificateThemeById(options.templateId ?? data.templateId);
  const certNo = `WEC-${Date.now().toString(36).toUpperCase()}`;

  const bodyParts: string[] = [];
  bodyParts.push(`<p>بدینوسیله تأیید می‌گردد که <strong>${escapeHtml(data.employeeName)}</strong>`);

  if (data.nationalId) {
    bodyParts.push(`به کد ملی ${toPersianDigits(data.nationalId)}`);
  }

  bodyParts.push(`در شرکت <strong>${escapeHtml(data.employerName)}</strong>`);

  if (data.employerRegistrationNo) {
    bodyParts.push(`(به شماره ثبت ${toPersianDigits(data.employerRegistrationNo)})`);
  }

  if (data.department) {
    bodyParts.push(`در واحد <strong>${escapeHtml(data.department)}</strong>`);
  }

  bodyParts.push(`به عنوان <strong>${escapeHtml(data.position)}</strong> مشغول به کار بوده است.`);

  let periodText: string;
  if (data.isCurrent) {
    periodText = `از تاریخ ${formatDate(data.startDate)} تاکنون`;
  } else if (data.endDate) {
    periodText = `از تاریخ ${formatDate(data.startDate)} لغایت ${formatDate(data.endDate)}`;
  } else {
    periodText = `از تاریخ ${formatDate(data.startDate)}`;
  }

  bodyParts.push(`مدت اشتغال ایشان ${periodText} می‌باشد.`);

  if (data.salary) {
    bodyParts.push(`آخرین حقوق دریافتی ایشان ${toPersianDigits(data.salary)} ریال بوده است.`);
  }

  if (data.reasonForLeaving) {
    bodyParts.push(`علت خاتمه همکاری: ${escapeHtml(data.reasonForLeaving)}.`);
  }

  if (data.description) {
    bodyParts.push(escapeHtml(data.description));
  }

  const logoHtml = data.logoDataUrl
    ? `<div class="logo-area"><img src="${escapeHtml(data.logoDataUrl)}" alt="لوگوی شرکت" /></div>`
    : '';

  const signatureHtml = data.signatureDataUrl
    ? `<div class="stamp-area">
        <div class="signature-line"></div>
        <img src="${escapeHtml(data.signatureDataUrl)}" alt="امضا" style="max-height:60px;margin-bottom:4px;" />
        <div class="signature-label">امضای صادرکننده</div>
      </div>`
    : `<div class="stamp-area">
        <div class="stamp-circle">مهر شرکت</div>
        <div class="signature-line"></div>
        <div class="signature-label">امضا</div>
      </div>`;

  const bilingualSection = data.templateId === 'bilingual' ? renderBilingual(data) : '';

  const watermarkOverlay =
    options.watermark !== false ? `<div class="watermark">${escapeHtml(WATERMARK_TEXT)}</div>` : '';

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>گواهی سابقه کار</title>
<style>${getBaseStyles(theme)}</style>
</head>
<body>
${watermarkOverlay}
<div class="container">
  ${logoHtml}
  <div class="header">
    <div class="seal">&#9670;</div>
    <h1>گواهی سابقه کار</h1>
    <div class="subtitle">طبق ماده ۲۴ قانون کار جمهوری اسلامی ایران</div>
  </div>
  <div class="certificate-number">شماره: ${certNo}</div>
  <div class="body-text">
    ${bodyParts.map((p) => `<p>${p}</p>`).join('')}
  </div>
  ${bilingualSection}
  <div class="footer">
    <div class="issuer">
      <div class="name">${escapeHtml(data.issuerName)}</div>
      <div class="position">${escapeHtml(data.issuerPosition)}</div>
      <div style="margin-top:8px;font-size:12px;color:${theme.colors.textSecondary}">
        تاریخ صدور: ${formatDate(data.certificateDate)}
      </div>
    </div>
    ${signatureHtml}
  </div>
  <div class="disclaimer">${escapeHtml(DISCLAIMER)}</div>
</div>
</body>
</html>`;
}
