import type { ResumeDraft } from './types';
import { DISCLAIMER, WATERMARK_TEXT } from './types';
import { toPersianDigits, formatDate, formatDateEn, getDocumentTitle } from './calculations';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderProfileSection(profile: ResumeDraft['profile'], isRtl: boolean): string {
  const name = escapeHtml(profile.fullName);
  const contactParts: string[] = [];
  if (profile.email) {
    contactParts.push(escapeHtml(profile.email));
  }
  if (profile.phone) {
    contactParts.push(toPersianDigits(profile.phone));
  }
  if (profile.address) {
    contactParts.push(escapeHtml(profile.address));
  }
  const contactLine =
    contactParts.length > 0 ? `<div class="contact">${contactParts.join(' | ')}</div>` : '';

  const linkParts: string[] = [];
  if (profile.linkedin) {
    linkParts.push(`<a href="${escapeHtml(profile.linkedin)}">LinkedIn</a>`);
  }
  if (profile.github) {
    linkParts.push(`<a href="${escapeHtml(profile.github)}">GitHub</a>`);
  }
  if (profile.portfolio) {
    linkParts.push(
      `<a href="${escapeHtml(profile.portfolio)}">${isRtl ? 'نمونه‌کار' : 'Portfolio'}</a>`,
    );
  }
  const linksLine =
    linkParts.length > 0 ? `<div class="links">${linkParts.join(' &middot; ')}</div>` : '';

  const photoSection = profile.photoDataUrl
    ? `<img class="photo" src="${escapeHtml(profile.photoDataUrl)}" alt="${name}" />`
    : '';

  const summarySection = profile.summary
    ? `<div class="summary">${escapeHtml(profile.summary)}</div>`
    : '';

  return `
    <div class="profile">
      ${photoSection}
      <h1>${name}</h1>
      ${contactLine}
      ${linksLine}
      ${summarySection}
    </div>`;
}

function renderExperiencesSection(experiences: ResumeDraft['experiences'], isRtl: boolean): string {
  if (experiences.length === 0) {
    return '';
  }
  const items = experiences
    .map((exp) => {
      const dateRange = exp.isCurrent
        ? isRtl
          ? 'تاکنون'
          : 'Present'
        : exp.endDate
          ? isRtl
            ? `${formatDate(exp.startDate)} تا ${formatDate(exp.endDate)}`
            : `${formatDateEn(exp.startDate)} - ${formatDateEn(exp.endDate)}`
          : isRtl
            ? formatDate(exp.startDate)
            : formatDateEn(exp.startDate);
      const descLines = exp.description
        .split('\n')
        .filter((l) => l.trim())
        .map((l) => `<li>${escapeHtml(l.trim())}</li>`)
        .join('');
      const descBlock = descLines ? `<ul>${descLines}</ul>` : '';
      return `
        <div class="entry">
          <div class="entry-header">
            <div class="entry-left">
              <span class="entry-title">${escapeHtml(exp.position)}</span>
              <span class="entry-subtitle">${escapeHtml(exp.company)}</span>
            </div>
            <span class="entry-date">${dateRange}</span>
          </div>
          ${descBlock}
        </div>`;
    })
    .join('');
  const heading = isRtl ? 'سوابق شغلی' : 'Work Experience';
  return `
    <div class="section">
      <h2>${heading}</h2>
      ${items}
    </div>`;
}

function renderEducationSection(education: ResumeDraft['education'], isRtl: boolean): string {
  if (education.length === 0) {
    return '';
  }
  const items = education
    .map((edu) => {
      const dateRange = edu.endDate
        ? isRtl
          ? `${formatDate(edu.startDate)} تا ${formatDate(edu.endDate)}`
          : `${formatDateEn(edu.startDate)} - ${formatDateEn(edu.endDate)}`
        : isRtl
          ? formatDate(edu.startDate)
          : formatDateEn(edu.startDate);
      const descBlock = edu.description
        ? `<div class="entry-desc">${escapeHtml(edu.description)}</div>`
        : '';
      return `
        <div class="entry">
          <div class="entry-header">
            <div class="entry-left">
              <span class="entry-title">${escapeHtml(edu.degree)} ${edu.field ? `- ${escapeHtml(edu.field)}` : ''}</span>
              <span class="entry-subtitle">${escapeHtml(edu.institution)}</span>
            </div>
            <span class="entry-date">${dateRange}</span>
          </div>
          ${descBlock}
        </div>`;
    })
    .join('');
  const heading = isRtl ? 'تحصیلات' : 'Education';
  return `
    <div class="section">
      <h2>${heading}</h2>
      ${items}
    </div>`;
}

function renderSkillsSection(skills: ResumeDraft['skills'], isRtl: boolean): string {
  if (skills.length === 0) {
    return '';
  }
  const items = skills
    .map((s) => {
      const levelText = s.level ? ` (${s.level})` : '';
      return `<span class="tag">${escapeHtml(s.name)}${levelText}</span>`;
    })
    .join('');
  const heading = isRtl ? 'مهارت‌ها' : 'Skills';
  return `
    <div class="section">
      <h2>${heading}</h2>
      <div class="tags">${items}</div>
    </div>`;
}

function renderLanguagesSection(languages: ResumeDraft['languages'], isRtl: boolean): string {
  if (languages.length === 0) {
    return '';
  }
  const items = languages
    .map((l) => {
      const levelText = l.level ? ` - ${l.level}` : '';
      return `<span class="tag">${escapeHtml(l.name)}${levelText}</span>`;
    })
    .join('');
  const heading = isRtl ? 'زبان‌ها' : 'Languages';
  return `
    <div class="section">
      <h2>${heading}</h2>
      <div class="tags">${items}</div>
    </div>`;
}

function renderProjectsSection(projects: ResumeDraft['projects'], isRtl: boolean): string {
  if (projects.length === 0) {
    return '';
  }
  const items = projects
    .map((proj) => {
      const techBlock = proj.technologies
        ? `<div class="entry-desc">${escapeHtml(proj.technologies)}</div>`
        : '';
      const urlBlock = proj.url
        ? `<a href="${escapeHtml(proj.url)}" class="entry-link">${escapeHtml(proj.url)}</a>`
        : '';
      const descBlock = proj.description
        ? `<div class="entry-desc">${escapeHtml(proj.description)}</div>`
        : '';
      return `
        <div class="entry">
          <span class="entry-title">${escapeHtml(proj.name)}</span>
          ${urlBlock}
          ${techBlock}
          ${descBlock}
        </div>`;
    })
    .join('');
  const heading = isRtl ? 'پروژه‌ها' : 'Projects';
  return `
    <div class="section">
      <h2>${heading}</h2>
      ${items}
    </div>`;
}

function renderCertificationsSection(
  certifications: ResumeDraft['certifications'],
  isRtl: boolean,
): string {
  if (certifications.length === 0) {
    return '';
  }
  const items = certifications
    .map((cert) => {
      const parts: string[] = [escapeHtml(cert.name)];
      if (cert.issuer) {
        parts.push(` - ${escapeHtml(cert.issuer)}`);
      }
      if (cert.date) {
        parts.push(isRtl ? ` (${formatDate(cert.date)})` : ` (${formatDateEn(cert.date)})`);
      }
      const link = cert.url
        ? ` <a href="${escapeHtml(cert.url)}">${isRtl ? 'مشاهده' : 'View'}</a>`
        : '';
      return `<div class="entry"><span class="entry-title">${parts.join('')}${link}</span></div>`;
    })
    .join('');
  const heading = isRtl ? 'گواهینامه‌ها و دوره‌ها' : 'Certifications';
  return `
    <div class="section">
      <h2>${heading}</h2>
      ${items}
    </div>`;
}

function renderCoverLetter(draft: ResumeDraft, isRtl: boolean): string {
  const greeting = isRtl ? 'بسم‌الله الرحمن الرحیم' : '';
  const senderName = escapeHtml(draft.profile.fullName);
  const recipient = draft.coverLetterRecipient
    ? escapeHtml(draft.coverLetterRecipient)
    : isRtl
      ? 'سَرکار خانم / جناب آقای [نام]'
      : 'Dear [Name]';
  const company = draft.coverLetterCompany
    ? escapeHtml(draft.coverLetterCompany)
    : isRtl
      ? '[نام شرکت]'
      : '[Company Name]';
  const position = draft.coverLetterPosition
    ? escapeHtml(draft.coverLetterPosition)
    : isRtl
      ? '[عنوان شغلی]'
      : '[Position]';
  const body = draft.coverLetterBody
    ? escapeHtml(draft.coverLetterBody).replace(/\n/g, '<br/>')
    : '';
  const dateStr = isRtl
    ? formatDate(new Date().toISOString())
    : formatDateEn(new Date().toISOString());
  const closing = isRtl ? 'با احترام' : 'Sincerely,';
  const signatureBlock = `
    <div class="signature">
      <br/>${closing}<br/><br/>
      <strong>${senderName}</strong>
    </div>`;

  return `
    <div class="letter">
      ${greeting ? `<div class="letter-greeting">${greeting}</div>` : ''}
      <div class="letter-date">${dateStr}</div>
      <div class="letter-recipient">
        ${recipient}<br/>
        ${company}
      </div>
      <div class="letter-subject">
        ${isRtl ? 'موضوع: درخواست شغل' : 'Subject: Job Application'} — ${position}
      </div>
      <div class="letter-body">${body}</div>
      ${signatureBlock}
    </div>`;
}

function getBaseStyles(isRtl: boolean): string {
  const fontStack = isRtl
    ? "'Vazirmatn', 'Tahoma', 'Arial', sans-serif"
    : "'Inter', 'Helvetica Neue', 'Arial', sans-serif";
  const dir = isRtl ? 'rtl' : 'ltr';
  return `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: ${fontStack};
    direction: ${dir};
    background: #f1f5f9;
    color: #1e293b;
    line-height: 1.6;
  }
  .container {
    max-width: 800px;
    margin: 20px auto;
    background: #fff;
    padding: 32px;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  .profile {
    text-align: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #1e293b;
  }
  .profile h1 {
    font-size: 24px;
    color: #1e293b;
    margin-bottom: 8px;
  }
  .photo {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 12px;
    border: 2px solid #e2e8f0;
  }
  .contact {
    font-size: 13px;
    color: #64748b;
    margin-bottom: 4px;
  }
  .links {
    font-size: 13px;
    color: #2563eb;
    margin-bottom: 8px;
  }
  .links a {
    color: #2563eb;
    text-decoration: none;
  }
  .summary {
    font-size: 14px;
    color: #475569;
    margin-top: 12px;
    text-align: ${isRtl ? 'right' : 'left'};
    line-height: 1.8;
  }
  .section {
    margin-bottom: 20px;
  }
  .section h2 {
    font-size: 16px;
    color: #1e293b;
    margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 1px solid #e2e8f0;
  }
  .entry {
    margin-bottom: 16px;
  }
  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 4px;
  }
  .entry-left {
    display: flex;
    flex-direction: column;
  }
  .entry-title {
    font-weight: 600;
    font-size: 14px;
    color: #1e293b;
  }
  .entry-subtitle {
    font-size: 13px;
    color: #475569;
  }
  .entry-date {
    font-size: 12px;
    color: #64748b;
    white-space: nowrap;
  }
  .entry-desc {
    font-size: 13px;
    color: #475569;
    margin-top: 4px;
  }
  .entry-link {
    font-size: 12px;
    color: #2563eb;
    text-decoration: none;
  }
  .entry ul {
    margin-top: 4px;
    padding-${isRtl ? 'right' : 'left'}: 20px;
    font-size: 13px;
    color: #475569;
  }
  .entry ul li {
    margin-bottom: 2px;
  }
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .tag {
    display: inline-block;
    padding: 4px 12px;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    font-size: 13px;
    color: #334155;
  }
  .letter {
    line-height: 2;
    font-size: 14px;
  }
  .letter-greeting {
    text-align: center;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
  }
  .letter-date {
    margin-bottom: 16px;
    font-size: 13px;
    color: #64748b;
  }
  .letter-recipient {
    margin-bottom: 16px;
    font-size: 14px;
  }
  .letter-subject {
    margin-bottom: 16px;
    font-weight: 600;
  }
  .letter-body {
    margin-bottom: 24px;
    white-space: pre-wrap;
  }
  .signature {
    font-size: 14px;
  }
  .watermark {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    font-size: 48px;
    color: rgba(220, 38, 38, 0.08);
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
    body { background: #fff; }
    .container { box-shadow: none; margin: 0; padding: 20px; max-width: 100%; }
    .watermark { display: none; }
  }`;
}

export function renderDocument(
  draft: ResumeDraft,
  options: { watermark?: boolean; rtl?: boolean },
): string {
  const isRtl = options.rtl !== false;
  const dir = isRtl ? 'rtl' : 'ltr';
  const lang = isRtl ? 'fa' : 'en';
  const docTitle = getDocumentTitle(draft.documentType);
  const isCoverLetter = draft.documentType === 'cover-letter';

  let contentSections: string;
  if (isCoverLetter) {
    contentSections = renderCoverLetter(draft, isRtl);
  } else {
    const parts: string[] = [renderProfileSection(draft.profile, isRtl)];
    parts.push(renderExperiencesSection(draft.experiences, isRtl));
    parts.push(renderEducationSection(draft.education, isRtl));
    parts.push(renderSkillsSection(draft.skills, isRtl));
    parts.push(renderLanguagesSection(draft.languages, isRtl));
    parts.push(renderProjectsSection(draft.projects, isRtl));
    parts.push(renderCertificationsSection(draft.certifications, isRtl));
    contentSections = parts.join('');
  }

  const watermarkOverlay = options.watermark
    ? `<div class="watermark">${escapeHtml(WATERMARK_TEXT)}</div>`
    : '';

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(docTitle)}</title>
<style>
${getBaseStyles(isRtl)}
</style>
</head>
<body>
${watermarkOverlay}
<div class="container">
  ${contentSections}
  <div class="disclaimer">
    ${escapeHtml(DISCLAIMER)}
  </div>
</div>
</body>
</html>`;
}
