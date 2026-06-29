import { Document, Packer, Paragraph, TextRun, AlignmentType, convertInchesToTwip } from 'docx';
import type { EmploymentData } from './types';
import { DISCLAIMER } from './types';
import { formatDate } from './calculations';

export function exportAsHtml(htmlContent: string, filename: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAsPrintableHtml(htmlContent: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  }
}

export async function downloadPdf(htmlContent: string, filename: string): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.title = filename;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  }
}

function buildDocxFromData(data: EmploymentData): Paragraph[] {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'قرارداد کار', bold: true, size: 28 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 60 },
    }),
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'طبق قانون کار جمهوری اسلامی ایران', size: 18, color: '666666' }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
  );

  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'طرفین قرارداد', bold: true, size: 22, color: '1e3a5f' })],
      spacing: { before: 200, after: 120 },
    }),
  );

  const addField = (label: string, value: string) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${label}: `, bold: true, size: 18 }),
          new TextRun({ text: value, size: 18 }),
        ],
        spacing: { after: 40 },
      }),
    );
  };

  addField('کارفرما', data.employerName);
  addField('کد ملی کارفرما', data.employerNationalId);
  addField('تلفن کارفرما', data.employerPhone);
  addField('آدرس کارفرما', data.employerAddress);
  if (data.employerEconomicCode) {
    addField('کد اقتصادی', data.employerEconomicCode);
  }
  children.push(new Paragraph({ spacing: { after: 80 } }));
  addField('کارمند', data.employeeName);
  addField('کد ملی کارمند', data.employeeNationalId);
  addField('تلفن کارمند', data.employeePhone);
  addField('آدرس کارمند', data.employeeAddress);
  if (data.employeeFatherName) {
    addField('نام پدر', data.employeeFatherName);
  }
  if (data.employeeBirthDate) {
    addField('تاریخ تولد', formatDate(data.employeeBirthDate));
  }

  children.push(new Paragraph({ spacing: { before: 200 } }));
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'مشخصات شغلی', bold: true, size: 22, color: '1e3a5f' })],
      spacing: { before: 200, after: 120 },
    }),
  );

  addField('عنوان شغلی', data.jobTitle);
  if (data.department) {
    addField('واحد', data.department);
  }
  addField('محل کار', data.workplace);
  addField('نوع قرارداد', data.contractType);
  addField('تاریخ شروع', formatDate(data.startDate));
  if (data.endDate) {
    addField('تاریخ پایان', formatDate(data.endDate));
  }
  if (data.probationaryPeriod) {
    addField('دوره آزمایشی', data.probationaryPeriod);
  }

  children.push(new Paragraph({ spacing: { before: 200 } }));
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'حقوق و مزایا', bold: true, size: 22, color: '1e3a5f' })],
      spacing: { before: 200, after: 120 },
    }),
  );

  addField('حقوق پایه', `${data.baseSalary} ریال`);
  if (data.housingAllowance) {
    addField('حق مسکن', `${data.housingAllowance} ریال`);
  }
  if (data.foodAllowance) {
    addField('حق تغذیه', `${data.foodAllowance} ریال`);
  }
  if (data.transportation) {
    addField('حق ایاب و ذهاب', `${data.transportation} ریال`);
  }
  if (data.overtimeRate) {
    addField('نرخ اضافه کار', data.overtimeRate);
  }
  if (data.bonus) {
    addField('پاداش', data.bonus);
  }
  addField('نوع بیمه', data.insuranceType);

  children.push(new Paragraph({ spacing: { before: 200 } }));
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'ساعت کار و مرخصی', bold: true, size: 22, color: '1e3a5f' })],
      spacing: { before: 200, after: 120 },
    }),
  );

  addField('ساعت کار روزانه', data.dailyWorkingHours);
  addField('روزهای تعطیل هفتگی', data.weeklyDaysOff);
  addField('مرخصی سالانه', data.annualLeave);
  if (data.sickLeave) {
    addField('مرخصی استعلاجی', data.sickLeave);
  }

  if (data.description) {
    children.push(new Paragraph({ spacing: { before: 120 } }));
    children.push(
      new Paragraph({
        children: [new TextRun({ text: data.description, size: 18 })],
        spacing: { after: 120 },
      }),
    );
  }

  children.push(
    new Paragraph({
      children: [new TextRun({ text: DISCLAIMER, size: 16, color: '666666', italics: true })],
      spacing: { before: 400, after: 200 },
    }),
  );

  return children;
}

export async function downloadDocx(data: EmploymentData, filename: string): Promise<void> {
  const children = buildDocxFromData(data);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1.25),
              right: convertInchesToTwip(1.25),
            },
          },
        },
        children,
      },
    ],
    styles: {
      default: {
        document: {
          run: { font: 'Arial', size: 20 },
        },
      },
    },
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function isDocxAvailable(): boolean {
  return true;
}
