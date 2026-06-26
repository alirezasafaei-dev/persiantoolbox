import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  convertInchesToTwip,
  TabStopType,
} from 'docx';
import type { ResumeDraft } from './types';
import { DISCLAIMER } from './types';
import { toPersianDigits, formatDate, formatDateEn } from './calculations';

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
    setTimeout(() => {
      printWindow.print();
    }, 300);
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
    setTimeout(() => {
      printWindow.print();
    }, 300);
  }
}

function addSectionHeading(children: Paragraph[], title: string): void {
  children.push(
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 24 })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
      border: {
        bottom: { color: 'CCCCCC', space: 4, style: 'single' as never, size: 6 },
      },
    }),
  );
}

function buildResumeFaDocx(draft: ResumeDraft): Paragraph[] {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      children: [new TextRun({ text: draft.profile.fullName, bold: true, size: 32 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 80 },
    }),
  );

  const contactParts: string[] = [];
  if (draft.profile.email) {
    contactParts.push(draft.profile.email);
  }
  if (draft.profile.phone) {
    contactParts.push(toPersianDigits(draft.profile.phone));
  }
  if (draft.profile.address) {
    contactParts.push(draft.profile.address);
  }
  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: contactParts.join(' | '), size: 18, color: '666666' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
      }),
    );
  }

  const linkParts: string[] = [];
  if (draft.profile.linkedin) {
    linkParts.push(`LinkedIn: ${draft.profile.linkedin}`);
  }
  if (draft.profile.github) {
    linkParts.push(`GitHub: ${draft.profile.github}`);
  }
  if (draft.profile.portfolio) {
    linkParts.push(`نمونه‌کار: ${draft.profile.portfolio}`);
  }
  if (linkParts.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: linkParts.join(' | '), size: 18, color: '2563eb' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
      }),
    );
  }

  if (draft.profile.summary) {
    addSectionHeading(children, 'درباره من');
    children.push(
      new Paragraph({
        children: [new TextRun({ text: draft.profile.summary, size: 20 })],
        spacing: { after: 120 },
      }),
    );
  }

  if (draft.experiences.length > 0) {
    addSectionHeading(children, 'سوابق شغلی');
    for (const exp of draft.experiences) {
      const dateRange = exp.isCurrent
        ? `${formatDate(exp.startDate)} تاکنون`
        : exp.endDate
          ? `${formatDate(exp.startDate)} تا ${formatDate(exp.endDate)}`
          : formatDate(exp.startDate);
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.position, bold: true, size: 20 }),
            new TextRun({ text: ` — ${exp.company}`, size: 20 }),
          ],
          spacing: { before: 120, after: 40 },
        }),
      );
      children.push(
        new Paragraph({
          children: [new TextRun({ text: dateRange, size: 16, color: '666666' })],
          spacing: { after: 60 },
        }),
      );
      if (exp.description) {
        const lines = exp.description.split('\n').filter((l) => l.trim());
        for (const line of lines) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: `• ${line.trim()}`, size: 18 })],
              spacing: { after: 20 },
              indent: { left: convertInchesToTwip(0.3) },
            }),
          );
        }
      }
    }
  }

  if (draft.education.length > 0) {
    addSectionHeading(children, 'تحصیلات');
    for (const edu of draft.education) {
      const dateRange = edu.endDate
        ? `${formatDate(edu.startDate)} تا ${formatDate(edu.endDate)}`
        : formatDate(edu.startDate);
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${edu.degree}${edu.field ? ` - ${edu.field}` : ''}`,
              bold: true,
              size: 20,
            }),
          ],
          spacing: { before: 120, after: 40 },
        }),
      );
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${edu.institution} | ${dateRange}`, size: 16, color: '666666' }),
          ],
          spacing: { after: 60 },
        }),
      );
      if (edu.description) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: edu.description, size: 18 })],
            spacing: { after: 60 },
          }),
        );
      }
    }
  }

  if (draft.skills.length > 0) {
    addSectionHeading(children, 'مهارت‌ها');
    const skillText = draft.skills
      .map((s) => (s.level ? `${s.name} (${s.level})` : s.name))
      .join(' • ');
    children.push(
      new Paragraph({
        children: [new TextRun({ text: skillText, size: 20 })],
        spacing: { after: 120 },
      }),
    );
  }

  if (draft.languages.length > 0) {
    addSectionHeading(children, 'زبان‌ها');
    const langText = draft.languages
      .map((l) => (l.level ? `${l.name} - ${l.level}` : l.name))
      .join(' • ');
    children.push(
      new Paragraph({
        children: [new TextRun({ text: langText, size: 20 })],
        spacing: { after: 120 },
      }),
    );
  }

  if (draft.projects.length > 0) {
    addSectionHeading(children, 'پروژه‌ها');
    for (const proj of draft.projects) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: proj.name, bold: true, size: 20 }),
            ...(proj.url
              ? [new TextRun({ text: ` (${proj.url})`, size: 16, color: '2563eb' })]
              : []),
          ],
          spacing: { before: 80, after: 40 },
        }),
      );
      if (proj.technologies) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: proj.technologies, size: 16, color: '666666' })],
            spacing: { after: 20 },
          }),
        );
      }
      if (proj.description) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: proj.description, size: 18 })],
            spacing: { after: 60 },
          }),
        );
      }
    }
  }

  if (draft.certifications.length > 0) {
    addSectionHeading(children, 'گواهینامه‌ها و دوره‌ها');
    for (const cert of draft.certifications) {
      const parts = [cert.name];
      if (cert.issuer) {
        parts.push(` - ${cert.issuer}`);
      }
      if (cert.date) {
        parts.push(` (${formatDate(cert.date)})`);
      }
      children.push(
        new Paragraph({
          children: [new TextRun({ text: parts.join(''), size: 20 })],
          spacing: { after: 60 },
        }),
      );
    }
  }

  return children;
}

function buildResumeEnDocx(draft: ResumeDraft): Paragraph[] {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      children: [new TextRun({ text: draft.profile.fullName, bold: true, size: 32 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 80 },
    }),
  );

  const contactParts: string[] = [];
  if (draft.profile.email) {
    contactParts.push(draft.profile.email);
  }
  if (draft.profile.phone) {
    contactParts.push(draft.profile.phone);
  }
  if (draft.profile.address) {
    contactParts.push(draft.profile.address);
  }
  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: contactParts.join(' | '), size: 18, color: '666666' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
      }),
    );
  }

  const linkParts: string[] = [];
  if (draft.profile.linkedin) {
    linkParts.push(`LinkedIn: ${draft.profile.linkedin}`);
  }
  if (draft.profile.github) {
    linkParts.push(`GitHub: ${draft.profile.github}`);
  }
  if (draft.profile.portfolio) {
    linkParts.push(`Portfolio: ${draft.profile.portfolio}`);
  }
  if (linkParts.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: linkParts.join(' | '), size: 18, color: '2563eb' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
      }),
    );
  }

  if (draft.profile.summary) {
    addSectionHeading(children, 'Summary');
    children.push(
      new Paragraph({
        children: [new TextRun({ text: draft.profile.summary, size: 20 })],
        spacing: { after: 120 },
      }),
    );
  }

  if (draft.experiences.length > 0) {
    addSectionHeading(children, 'Work Experience');
    for (const exp of draft.experiences) {
      const dateRange = exp.isCurrent
        ? `${formatDateEn(exp.startDate)} - Present`
        : exp.endDate
          ? `${formatDateEn(exp.startDate)} - ${formatDateEn(exp.endDate)}`
          : formatDateEn(exp.startDate);
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.position, bold: true, size: 20 }),
            new TextRun({ text: ` — ${exp.company}`, size: 20 }),
          ],
          tabStops: [{ type: TabStopType.RIGHT, position: convertInchesToTwip(6.5) }],
          spacing: { before: 120, after: 40 },
        }),
      );
      children.push(
        new Paragraph({
          children: [new TextRun({ text: dateRange, size: 16, color: '666666' })],
          spacing: { after: 60 },
        }),
      );
      if (exp.description) {
        const lines = exp.description.split('\n').filter((l) => l.trim());
        for (const line of lines) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: `• ${line.trim()}`, size: 18 })],
              spacing: { after: 20 },
              indent: { left: convertInchesToTwip(0.3) },
            }),
          );
        }
      }
    }
  }

  if (draft.education.length > 0) {
    addSectionHeading(children, 'Education');
    for (const edu of draft.education) {
      const dateRange = edu.endDate
        ? `${formatDateEn(edu.startDate)} - ${formatDateEn(edu.endDate)}`
        : formatDateEn(edu.startDate);
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`,
              bold: true,
              size: 20,
            }),
          ],
          spacing: { before: 120, after: 40 },
        }),
      );
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${edu.institution} | ${dateRange}`, size: 16, color: '666666' }),
          ],
          spacing: { after: 60 },
        }),
      );
      if (edu.description) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: edu.description, size: 18 })],
            spacing: { after: 60 },
          }),
        );
      }
    }
  }

  if (draft.skills.length > 0) {
    addSectionHeading(children, 'Skills');
    const skillText = draft.skills
      .map((s) => (s.level ? `${s.name} (${s.level})` : s.name))
      .join(' • ');
    children.push(
      new Paragraph({
        children: [new TextRun({ text: skillText, size: 20 })],
        spacing: { after: 120 },
      }),
    );
  }

  if (draft.languages.length > 0) {
    addSectionHeading(children, 'Languages');
    const langText = draft.languages
      .map((l) => (l.level ? `${l.name} - ${l.level}` : l.name))
      .join(' • ');
    children.push(
      new Paragraph({
        children: [new TextRun({ text: langText, size: 20 })],
        spacing: { after: 120 },
      }),
    );
  }

  if (draft.projects.length > 0) {
    addSectionHeading(children, 'Projects');
    for (const proj of draft.projects) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: proj.name, bold: true, size: 20 }),
            ...(proj.url
              ? [new TextRun({ text: ` (${proj.url})`, size: 16, color: '2563eb' })]
              : []),
          ],
          spacing: { before: 80, after: 40 },
        }),
      );
      if (proj.technologies) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: proj.technologies, size: 16, color: '666666' })],
            spacing: { after: 20 },
          }),
        );
      }
      if (proj.description) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: proj.description, size: 18 })],
            spacing: { after: 60 },
          }),
        );
      }
    }
  }

  if (draft.certifications.length > 0) {
    addSectionHeading(children, 'Certifications');
    for (const cert of draft.certifications) {
      const parts = [cert.name];
      if (cert.issuer) {
        parts.push(` - ${cert.issuer}`);
      }
      if (cert.date) {
        parts.push(` (${formatDateEn(cert.date)})`);
      }
      children.push(
        new Paragraph({
          children: [new TextRun({ text: parts.join(''), size: 20 })],
          spacing: { after: 60 },
        }),
      );
    }
  }

  return children;
}

function buildCoverLetterDocx(draft: ResumeDraft): Paragraph[] {
  const children: Paragraph[] = [];
  const dateStr = formatDate(new Date().toISOString());
  const senderName = draft.profile.fullName;
  const recipient = draft.coverLetterRecipient ?? 'سَرکار خانم / جناب آقای [نام]';
  const company = draft.coverLetterCompany ?? '[نام شرکت]';
  const position = draft.coverLetterPosition ?? '[عنوان شغلی]';

  children.push(
    new Paragraph({
      children: [new TextRun({ text: senderName, bold: true, size: 28 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 160 },
    }),
  );

  children.push(
    new Paragraph({
      children: [new TextRun({ text: dateStr, size: 18, color: '666666' })],
      spacing: { after: 200 },
    }),
  );

  children.push(
    new Paragraph({
      children: [new TextRun({ text: `${recipient}`, size: 20 })],
      spacing: { after: 40 },
    }),
  );

  children.push(
    new Paragraph({
      children: [new TextRun({ text: company, size: 20 })],
      spacing: { after: 200 },
    }),
  );

  children.push(
    new Paragraph({
      children: [new TextRun({ text: `موضوع: درخواست شغل — ${position}`, bold: true, size: 20 })],
      spacing: { after: 200 },
    }),
  );

  if (draft.coverLetterBody) {
    const paragraphs = draft.coverLetterBody.split('\n').filter((l) => l.trim());
    for (const para of paragraphs) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: para.trim(), size: 20 })],
          spacing: { after: 120 },
        }),
      );
    }
  }

  children.push(
    new Paragraph({
      children: [new TextRun({ text: '' })],
      spacing: { after: 160 },
    }),
  );

  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'با احترام', size: 20 })],
      spacing: { after: 80 },
    }),
  );

  children.push(
    new Paragraph({
      children: [new TextRun({ text: senderName, bold: true, size: 22 })],
      spacing: { after: 100 },
    }),
  );

  return children;
}

export async function downloadDocx(draft: ResumeDraft, filename: string): Promise<void> {
  let sectionChildren: Paragraph[];
  if (draft.documentType === 'cover-letter') {
    sectionChildren = buildCoverLetterDocx(draft);
  } else if (draft.documentType === 'resume-fa') {
    sectionChildren = buildResumeFaDocx(draft);
  } else {
    sectionChildren = buildResumeEnDocx(draft);
  }

  sectionChildren.push(
    new Paragraph({
      children: [new TextRun({ text: DISCLAIMER, size: 16, color: '666666', italics: true })],
      spacing: { before: 400, after: 200 },
    }),
  );

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
        children: sectionChildren,
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
