/**
 * Salary Export Utilities
 * CSV export and print-to-PDF for salary calculations
 */

import type { SalaryOutput, MinimumWageOutput } from '@/features/salary/salary.types';

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('fa-IR').format(Math.round(amount));
}

type ExportData = {
  mode: 'gross-to-net' | 'net-to-gross' | 'minimum-wage';
  inputs: Record<string, string>;
  result: SalaryOutput | MinimumWageOutput;
  generatedAt: string;
};

export function downloadSalaryCsv(data: ExportData): void {
  const rows: string[][] = [
    ['گزارش محاسبه حقوق'],
    ['تاریخ', data.generatedAt],
    ['حالت محاسبه', getModeLabel(data.mode)],
    [],
    ['ورودی‌ها'],
  ];

  for (const [label, value] of Object.entries(data.inputs)) {
    if (value && value !== '0' && value !== 'false') {
      rows.push([label, value]);
    }
  }

  rows.push([]);
  rows.push(['نتیجه محاسبه']);

  if (data.mode === 'minimum-wage') {
    const r = data.result as MinimumWageOutput;
    rows.push(['حقوق پایه', formatMoney(r.baseSalary)]);
    rows.push(['کمک هزینه مسکن', formatMoney(r.housingAllowance)]);
    rows.push(['کمک هزینه غذا', formatMoney(r.foodAllowance)]);
    rows.push(['حق اولاد', formatMoney(r.childAllowance)]);
    rows.push(['حق تاهل', formatMoney(r.marriageAllowance)]);
    rows.push(['پایه سنوات', formatMoney(r.seniorityAllowance)]);
    rows.push(['مجموع حقوق ناخالص', formatMoney(r.totalGross)]);
    rows.push([]);
    rows.push(['بیمه', formatMoney(r.insuranceAmount)]);
    rows.push(['مالیات', formatMoney(r.taxAmount)]);
    rows.push(['حقوق خالص', formatMoney(r.netSalary)]);
  } else {
    const r = data.result as SalaryOutput;
    rows.push(['حقوق ناخالص', formatMoney(r.grossSalary)]);
    rows.push(['مجموع کسورات', formatMoney(r.summary.totalDeductions)]);
    rows.push(['  بیمه', formatMoney(r.summary.insurance)]);
    rows.push(['  مالیات', formatMoney(r.summary.tax)]);
    rows.push(['حقوق خالص', formatMoney(r.netSalary)]);
  }

  rows.push([]);
  rows.push(['تولید شده توسط جعبه ابزار فارسی - persiantoolbox.ir']);

  const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `salary-report-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printSalaryReport(data: ExportData): void {
  const modeLabel = getModeLabel(data.mode);

  let resultHtml = '';
  if (data.mode === 'minimum-wage') {
    const r = data.result as MinimumWageOutput;
    resultHtml = `
      <table style="width:100%; border-collapse:collapse; margin:10px 0">
        <tr><td style="padding:8px; border:1px solid #ddd">حقوق پایه</td><td style="padding:8px; border:1px solid #ddd; text-align:left">${formatMoney(r.baseSalary)} تومان</td></tr>
        <tr><td style="padding:8px; border:1px solid #ddd">کمک هزینه مسکن</td><td style="padding:8px; border:1px solid #ddd; text-align:left">${formatMoney(r.housingAllowance)} تومان</td></tr>
        <tr><td style="padding:8px; border:1px solid #ddd">کمک هزینه غذا</td><td style="padding:8px; border:1px solid #ddd; text-align:left">${formatMoney(r.foodAllowance)} تومان</td></tr>
        <tr><td style="padding:8px; border:1px solid #ddd">حق اولاد</td><td style="padding:8px; border:1px solid #ddd; text-align:left">${formatMoney(r.childAllowance)} تومان</td></tr>
        <tr><td style="padding:8px; border:1px solid #ddd">حق تاهل</td><td style="padding:8px; border:1px solid #ddd; text-align:left">${formatMoney(r.marriageAllowance)} تومان</td></tr>
        <tr><td style="padding:8px; border:1px solid #ddd">پایه سنوات</td><td style="padding:8px; border:1px solid #ddd; text-align:left">${formatMoney(r.seniorityAllowance)} تومان</td></tr>
        <tr style="background:#f5f5f5">
          <td style="padding:8px; border:1px solid #ddd; font-weight:bold">مجموع حقوق ناخالص</td>
          <td style="padding:8px; border:1px solid #ddd; text-align:left; font-weight:bold">${formatMoney(r.totalGross)} تومان</td>
        </tr>
        <tr><td colspan="2" style="padding:4px"></td></tr>
        <tr><td style="padding:8px; border:1px solid #ddd">بیمه</td><td style="padding:8px; border:1px solid #ddd; text-align:left">${formatMoney(r.insuranceAmount)} تومان</td></tr>
        <tr><td style="padding:8px; border:1px solid #ddd">مالیات</td><td style="padding:8px; border:1px solid #ddd; text-align:left">${formatMoney(r.taxAmount)} تومان</td></tr>
        <tr style="background:#e8f5e9">
          <td style="padding:8px; border:1px solid #ddd; font-weight:bold">حقوق خالص</td>
          <td style="padding:8px; border:1px solid #ddd; text-align:left; font-weight:bold; color:#2e7d32">${formatMoney(r.netSalary)} تومان</td>
        </tr>
      </table>`;
  } else {
    const r = data.result as SalaryOutput;
    resultHtml = `
      <table style="width:100%; border-collapse:collapse; margin:10px 0">
        <tr><td style="padding:8px; border:1px solid #ddd">حقوق ناخالص</td><td style="padding:8px; border:1px solid #ddd; text-align:left">${formatMoney(r.grossSalary)} تومان</td></tr>
        <tr><td style="padding:8px; border:1px solid #ddd">مجموع کسورات</td><td style="padding:8px; border:1px solid #ddd; text-align:left">${formatMoney(r.summary.totalDeductions)} تومان</td></tr>
        <tr><td style="padding:8px 20px; border:1px solid #ddd">بیمه</td><td style="padding:8px; border:1px solid #ddd; text-align:left">${formatMoney(r.summary.insurance)} تومان</td></tr>
        <tr><td style="padding:8px 20px; border:1px solid #ddd">مالیات</td><td style="padding:8px; border:1px solid #ddd; text-align:left">${formatMoney(r.summary.tax)} تومان</td></tr>
        <tr style="background:#e8f5e9">
          <td style="padding:8px; border:1px solid #ddd; font-weight:bold">حقوق خالص</td>
          <td style="padding:8px; border:1px solid #ddd; text-align:left; font-weight:bold; color:#2e7d32">${formatMoney(r.netSalary)} تومان</td>
        </tr>
      </table>`;
  }

  let inputsHtml = '';
  for (const [label, value] of Object.entries(data.inputs)) {
    if (value && value !== '0' && value !== 'false') {
      inputsHtml += `<tr><td style="padding:4px 8px; border:1px solid #eee">${label}</td><td style="padding:4px 8px; border:1px solid #eee">${value}</td></tr>`;
    }
  }

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="fa">
    <head>
      <meta charset="UTF-8">
      <title>گزارش محاسبه حقوق - جعبه ابزار فارسی</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333 }
        h1 { font-size: 24px; border-bottom: 2px solid #2563eb; padding-bottom: 8px }
        h2 { font-size: 18px; margin-top: 20px; color: #555 }
        .meta { color: #888; font-size: 12px; margin-bottom: 20px }
        .footer { margin-top: 40px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 10px; color: #999 }
        @media print { body { margin: 20px } }
      </style>
    </head>
    <body>
      <h1>گزارش محاسبه حقوق</h1>
      <div class="meta">حالت: ${modeLabel} | تاریخ: ${data.generatedAt}</div>

      <h2>ورودی‌ها</h2>
      <table style="width:100%; border-collapse:collapse">
        ${inputsHtml}
      </table>

      <h2>نتیجه محاسبه</h2>
      ${resultHtml}

      <div class="footer">
        تولید شده توسط جعبه ابزار فارسی - persiantoolbox.ir<br>
        این گزارش صرفاً جنبه اطلاعاتی دارد و جایگزین مشاوره حرفه‌ای نیست.
      </div>
    </body>
    </html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
}

function getModeLabel(mode: string): string {
  switch (mode) {
    case 'gross-to-net':
      return 'ناخالص به خالص';
    case 'net-to-gross':
      return 'خالص به ناخالص';
    case 'minimum-wage':
      return 'حداقل حقوق';
    default:
      return mode;
  }
}
