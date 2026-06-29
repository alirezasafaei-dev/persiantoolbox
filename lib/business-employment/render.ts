import type { EmploymentData } from './types';
import { DISCLAIMER, WATERMARK_TEXT } from './types';
import { formatDate } from './calculations';
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

function contractTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    permanent: 'دائم',
    'fixed-term': 'موقت',
    'part-time': 'پاره وقت',
    probationary: 'آزمایشی',
  };
  return labels[type] ?? type;
}

export function renderEmployment(
  data: EmploymentData,
  options: { watermark?: boolean; premiumClauses?: string[] },
): string {
  const contractNo = `EC-${Date.now().toString(36).toUpperCase()}`;

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
          title: `بند ${i + 1}`,
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

  const employerSignatureHtml = data.employerSignature
    ? `<img src="${escapeHtml(data.employerSignature)}" alt="امضای کارفرما" />`
    : '<div class="signature-line"></div>';

  const employeeSignatureHtml = data.employeeSignature
    ? `<img src="${escapeHtml(data.employeeSignature)}" alt="امضای کارمند" />`
    : '<div class="signature-line"></div>';

  const watermarkOverlay =
    options.watermark !== false ? `<div class="watermark">${escapeHtml(WATERMARK_TEXT)}</div>` : '';

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>قرارداد کار</title>
<style>${getBaseStyles()}</style>
</head>
<body>
${watermarkOverlay}
<div class="container">
  <div class="header">
    <h1>قرارداد کار</h1>
    <div class="subtitle">این قرارداد بر اساس قانون کار جمهوری اسلامی ایران بین طرفین زیر منعقد گردید</div>
  </div>
  <div class="contract-number">شماره قرارداد: ${contractNo}</div>

  <div class="section">
    <h2>طرفین قرارداد</h2>
    <div class="field-row"><span class="field-label">کارفرما:</span><span class="field-value">${escapeHtml(data.employerName)}</span></div>
    <div class="field-row"><span class="field-label">کد ملی / شماره ثبت:</span><span class="field-value">${escapeHtml(data.employerNationalId)}</span></div>
    <div class="field-row"><span class="field-label">تلفن:</span><span class="field-value">${escapeHtml(data.employerPhone)}</span></div>
    <div class="field-row"><span class="field-label">آدرس:</span><span class="field-value">${escapeHtml(data.employerAddress)}</span></div>
    ${data.employerEconomicCode ? `<div class="field-row"><span class="field-label">کد اقتصادی:</span><span class="field-value">${escapeHtml(data.employerEconomicCode)}</span></div>` : ''}
    <div style="margin-top:12px;"></div>
    <div class="field-row"><span class="field-label">کارمند:</span><span class="field-value">${escapeHtml(data.employeeName)}</span></div>
    <div class="field-row"><span class="field-label">کد ملی:</span><span class="field-value">${escapeHtml(data.employeeNationalId)}</span></div>
    <div class="field-row"><span class="field-label">تلفن:</span><span class="field-value">${escapeHtml(data.employeePhone)}</span></div>
    <div class="field-row"><span class="field-label">آدرس:</span><span class="field-value">${escapeHtml(data.employeeAddress)}</span></div>
    ${data.employeeFatherName ? `<div class="field-row"><span class="field-label">نام پدر:</span><span class="field-value">${escapeHtml(data.employeeFatherName)}</span></div>` : ''}
    ${data.employeeBirthDate ? `<div class="field-row"><span class="field-label">تاریخ تولد:</span><span class="field-value">${formatDate(data.employeeBirthDate)}</span></div>` : ''}
  </div>

  <div class="section">
    <h2>مشخصات شغلی</h2>
    <div class="field-row"><span class="field-label">عنوان شغلی:</span><span class="field-value">${escapeHtml(data.jobTitle)}</span></div>
    ${data.department ? `<div class="field-row"><span class="field-label">واحد:</span><span class="field-value">${escapeHtml(data.department)}</span></div>` : ''}
    <div class="field-row"><span class="field-label">محل کار:</span><span class="field-value">${escapeHtml(data.workplace)}</span></div>
    <div class="field-row"><span class="field-label">نوع قرارداد:</span><span class="field-value">${contractTypeLabel(data.contractType)}</span></div>
    <div class="field-row"><span class="field-label">تاریخ شروع:</span><span class="field-value">${formatDate(data.startDate)}</span></div>
    ${data.endDate ? `<div class="field-row"><span class="field-label">تاریخ پایان:</span><span class="field-value">${formatDate(data.endDate)}</span></div>` : ''}
    ${data.probationaryPeriod ? `<div class="field-row"><span class="field-label">دوره آزمایشی:</span><span class="field-value">${escapeHtml(data.probationaryPeriod)}</span></div>` : ''}
  </div>

  <div class="section">
    <h2>حقوق و مزایا</h2>
    <div class="field-row"><span class="field-label">حقوق پایه:</span><span class="field-value">${escapeHtml(data.baseSalary)} ریال</span></div>
    ${data.housingAllowance ? `<div class="field-row"><span class="field-label">حق مسکن:</span><span class="field-value">${escapeHtml(data.housingAllowance)} ریال</span></div>` : ''}
    ${data.foodAllowance ? `<div class="field-row"><span class="field-label">حق تغذیه:</span><span class="field-value">${escapeHtml(data.foodAllowance)} ریال</span></div>` : ''}
    ${data.transportation ? `<div class="field-row"><span class="field-label">حق ایاب و ذهاب:</span><span class="field-value">${escapeHtml(data.transportation)} ریال</span></div>` : ''}
    ${data.overtimeRate ? `<div class="field-row"><span class="field-label">نرخ اضافه کار:</span><span class="field-value">${escapeHtml(data.overtimeRate)}</span></div>` : ''}
    ${data.bonus ? `<div class="field-row"><span class="field-label">پاداش:</span><span class="field-value">${escapeHtml(data.bonus)}</span></div>` : ''}
    <div class="field-row"><span class="field-label">نوع بیمه:</span><span class="field-value">${escapeHtml(data.insuranceType)}</span></div>
  </div>

  <div class="section">
    <h2>ساعت کار و مرخصی</h2>
    <div class="field-row"><span class="field-label">ساعت کار روزانه:</span><span class="field-value">${escapeHtml(data.dailyWorkingHours)}</span></div>
    <div class="field-row"><span class="field-label">روزهای تعطیل هفتگی:</span><span class="field-value">${escapeHtml(data.weeklyDaysOff)}</span></div>
    <div class="field-row"><span class="field-label">مرخصی سالانه:</span><span class="field-value">${escapeHtml(data.annualLeave)}</span></div>
    ${data.sickLeave ? `<div class="field-row"><span class="field-label">مرخصی استعلاجی:</span><span class="field-value">${escapeHtml(data.sickLeave)}</span></div>` : ''}
  </div>

  ${data.description ? `<div class="section"><h2>توضیحات</h2><p style="font-size:13px;color:#475569;">${escapeHtml(data.description)}</p></div>` : ''}

  <div class="section">
    <h2>شرایط و بندهای قرارداد</h2>
    ${clausesHtml}
  </div>

  <div class="signatures">
    <div class="signature-box">
      <h3>کارفرما</h3>
      ${employerSignatureHtml}
      <div class="signature-label">${escapeHtml(data.employerName)}</div>
    </div>
    <div class="signature-box">
      <h3>کارمند</h3>
      ${employeeSignatureHtml}
      <div class="signature-label">${escapeHtml(data.employeeName)}</div>
    </div>
  </div>

  <div class="disclaimer">${escapeHtml(DISCLAIMER)}</div>
</div>
</body>
</html>`;
}
