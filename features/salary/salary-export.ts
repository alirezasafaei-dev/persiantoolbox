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
        .meta { color: #666; font-size: 12px; margin-bottom: 20px }
        .footer { margin-top: 40px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 10px; color: #666 }
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

export function downloadPayslip(data: ExportData): void {
  if (data.mode === 'minimum-wage') {
    downloadMinimumWagePayslip(data as ExportData & { result: MinimumWageOutput });
    return;
  }

  const r = data.result as SalaryOutput;
  const html = generatePayslipHtml({
    title: 'فیش حقوقی',
    generatedAt: data.generatedAt,
    inputs: data.inputs,
    rows: [
      { label: 'حقوق پایه', value: data.inputs['حقوق پایه'] ?? '', section: 'income' },
      {
        label: 'مجموع کسورات',
        value: formatMoney(r.summary.totalDeductions),
        section: 'deduction',
        highlight: true,
      },
      { label: 'بیمه', value: formatMoney(r.summary.insurance), section: 'deduction' },
      { label: 'مالیات', value: formatMoney(r.summary.tax), section: 'deduction' },
      { label: 'حقوق خالص', value: formatMoney(r.netSalary), section: 'net', highlight: true },
    ],
  });

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
}

function downloadMinimumWagePayslip(data: ExportData & { result: MinimumWageOutput }): void {
  const r = data.result;
  const html = generatePayslipHtml({
    title: 'فیش حقوقی - حداقل دستمزد',
    generatedAt: data.generatedAt,
    inputs: data.inputs,
    rows: [
      { label: 'حقوق پایه', value: formatMoney(r.baseSalary), section: 'income' },
      { label: 'کمک هزینه مسکن', value: formatMoney(r.housingAllowance), section: 'income' },
      { label: 'کمک هزینه غذا', value: formatMoney(r.foodAllowance), section: 'income' },
      { label: 'حق اولاد', value: formatMoney(r.childAllowance), section: 'income' },
      { label: 'حق تاهل', value: formatMoney(r.marriageAllowance), section: 'income' },
      { label: 'پایه سنوات', value: formatMoney(r.seniorityAllowance), section: 'income' },
      {
        label: 'مجموع حقوق ناخالص',
        value: formatMoney(r.totalGross),
        section: 'subtotal',
        highlight: true,
      },
      { label: 'بیمه', value: formatMoney(r.insuranceAmount), section: 'deduction' },
      { label: 'مالیات', value: formatMoney(r.taxAmount), section: 'deduction' },
      { label: 'حقوق خالص', value: formatMoney(r.netSalary), section: 'net', highlight: true },
    ],
  });

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
}

type PayslipRow = {
  label: string;
  value: string;
  section: 'income' | 'subtotal' | 'deduction' | 'net';
  highlight?: boolean;
};

function generatePayslipHtml(data: {
  title: string;
  generatedAt: string;
  inputs: Record<string, string>;
  rows: PayslipRow[];
}): string {
  const incomeRows = data.rows.filter((r) => r.section === 'income');
  const subtotalRow = data.rows.find((r) => r.section === 'subtotal');
  const deductionRows = data.rows.filter((r) => r.section === 'deduction');
  const netRow = data.rows.find((r) => r.section === 'net');

  const inputRows = Object.entries(data.inputs)
    .filter((entry) => entry[1] && entry[1] !== '0' && entry[1] !== 'false')
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px; border:1px solid #e0e0e0; font-size:13px; color:#666">${k}</td>` +
        `<td style="padding:6px 12px; border:1px solid #e0e0e0; font-size:13px; text-align:left; font-weight:500">${v}</td></tr>`,
    )
    .join('');

  const incomeHtml = incomeRows
    .map(
      (r) => `
    <tr>
      <td style="padding:8px 12px; border:1px solid #e0e0e0; font-size:14px">${r.label}</td>
      <td style="padding:8px 12px; border:1px solid #e0e0e0; font-size:14px; text-align:left; font-weight:500">${r.value} تومان</td>
    </tr>`,
    )
    .join('');

  const deductionHtml = deductionRows
    .map(
      (r) => `
    <tr>
      <td style="padding:8px 12px; border:1px solid #e0e0e0; font-size:14px">${r.label}</td>
      <td style="padding:8px 12px; border:1px solid #e0e0e0; font-size:14px; text-align:left; font-weight:500; color:#c62828">${r.value} تومان</td>
    </tr>`,
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="fa">
    <head>
      <meta charset="UTF-8">
      <title>${data.title} - جعبه ابزار فارسی</title>
      <style>
        body { font-family: 'Tahoma', 'Arial', sans-serif; margin: 0; padding: 20px; color: #333 }
        .payslip { max-width: 700px; margin: 0 auto; border: 2px solid #1a237e; border-radius: 8px; overflow: hidden }
        .header { background: #1a237e; color: white; padding: 20px; text-align: center }
        .header h1 { margin: 0; font-size: 20px }
        .header .subtitle { font-size: 12px; opacity: 0.8; margin-top: 4px }
        .content { padding: 20px }
        .meta-table { width: 100%; margin-bottom: 20px }
        .meta-table td { padding: 6px 12px; border: 1px solid #e0e0e0; font-size: 13px }
        .section-title { background: #f5f5f5; padding: 8px 12px; font-weight: bold; font-size: 14px; border: 1px solid #e0e0e0; margin-top: 16px }
        .data-table { width: 100%; border-collapse: collapse }
        .subtotal { background: #e3f2fd; font-weight: bold }
        .net-row { background: #e8f5e9; font-weight: bold; font-size: 16px }
        .footer { padding: 12px 20px; background: #f5f5f5; font-size: 11px; color: #666; text-align: center; border-top: 1px solid #e0e0e0 }
        @media print { body { padding: 10px } .payslip { border-width: 1px } }
      </style>
    </head>
    <body>
      <div class="payslip">
        <div class="header">
          <h1>${data.title}</h1>
          <div class="subtitle">تاریخ صدور: ${data.generatedAt}</div>
        </div>
        <div class="content">
          ${
            inputRows
              ? `
          <div class="section-title">اطلاعات ورودی</div>
          <table class="meta-table"><tbody>${inputRows}</tbody></table>
          `
              : ''
          }

          <div class="section-title">دریافتی‌ها</div>
          <table class="data-table"><tbody>${incomeHtml}</tbody></table>

          ${
            subtotalRow
              ? `
          <table class="data-table"><tbody>
            <tr class="subtotal">
              <td style="padding:8px 12px; border:1px solid #e0e0e0; font-size:14px">${subtotalRow.label}</td>
              <td style="padding:8px 12px; border:1px solid #e0e0e0; font-size:14px; text-align:left">${subtotalRow.value} تومان</td>
            </tr>
          </tbody></table>`
              : ''
          }

          <div class="section-title">کسورات</div>
          <table class="data-table"><tbody>${deductionHtml}</tbody></table>

          ${
            netRow
              ? `
          <table class="data-table"><tbody>
            <tr class="net-row">
              <td style="padding:10px 12px; border:2px solid #2e7d32; font-size:16px; color:#2e7d32">${netRow.label}</td>
              <td style="padding:10px 12px; border:2px solid #2e7d32; font-size:18px; text-align:left; color:#2e7d32; font-weight:bold">${netRow.value} تومان</td>
            </tr>
          </tbody></table>`
              : ''
          }
        </div>
        <div class="footer">
          تولید شده توسط جعبه ابزار فارسی - persiantoolbox.ir<br>
          این فیش صرفاً جنبه اطلاعاتی دارد و جایگزین فیش رسمی سازمان نیست.
        </div>
      </div>
    </body>
    </html>`;
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
