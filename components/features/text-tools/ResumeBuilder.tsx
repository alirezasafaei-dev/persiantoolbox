'use client';

import { useState, useRef } from 'react';

type ResumeData = {
  fullName: string;
  email: string;
  phone: string;
  summary: string;
  education: Array<{ school: string; degree: string; year: string }>;
  experience: Array<{ company: string; role: string; period: string; description: string }>;
  skills: string[];
};

const emptyResume: ResumeData = {
  fullName: '',
  email: '',
  phone: '',
  summary: '',
  education: [{ school: '', degree: '', year: '' }],
  experience: [{ company: '', role: '', period: '', description: '' }],
  skills: [],
};

export default function ResumeBuilder() {
  const [resume, setResume] = useState<ResumeData>(emptyResume);
  const [skillInput, setSkillInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  const updateField = (field: keyof ResumeData, value: string) => {
    setResume((prev) => ({ ...prev, [field]: value }));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setResume((prev) => {
      const edu = [...prev.education];
      edu[index] = { ...edu[index]!, [field]: value };
      return { ...prev, education: edu };
    });
  };

  const addEducation = () => {
    setResume((prev) => ({
      ...prev,
      education: [...prev.education, { school: '', degree: '', year: '' }],
    }));
  };

  const removeEducation = (index: number) => {
    setResume((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setResume((prev) => {
      const exp = [...prev.experience];
      exp[index] = { ...exp[index]!, [field]: value };
      return { ...prev, experience: exp };
    });
  };

  const addExperience = () => {
    setResume((prev) => ({
      ...prev,
      experience: [...prev.experience, { company: '', role: '', period: '', description: '' }],
    }));
  };

  const removeExperience = (index: number) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !resume.skills.includes(skillInput.trim())) {
      setResume((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setResume((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handlePrint = () => {
    const content = resumeRef.current;
    if (!content) {
      return;
    }
    const win = window.open('', '_blank');
    if (!win) {
      return;
    }
    win.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="utf-8">
        <title>رزومه ${resume.fullName}</title>
        <style>
          body { font-family: 'Vazirmatn', 'Tahoma', sans-serif; margin: 20px; color: #333; line-height: 1.8; }
          h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 8px; }
          h2 { color: #1e40af; margin-top: 20px; }
          .contact { display: flex; gap: 20px; color: #666; margin-bottom: 16px; }
          .section { margin-bottom: 16px; }
          .item { margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #eee; }
          .item-title { font-weight: bold; color: #1e40af; }
          .item-sub { color: #666; font-size: 0.9em; }
          .skills { display: flex; flex-wrap: wrap; gap: 6px; }
          .skill { background: #eff6ff; color: #1e40af; padding: 2px 10px; border-radius: 12px; font-size: 0.85em; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>${content.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const inputClass =
    'w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none';

  return (
    <div className="space-y-8 py-8">
      <section className="section-surface rounded-[var(--radius-lg)] border border-[var(--border-light)] p-6 md:p-8">
        <h1 className="text-2xl font-black text-[var(--text-primary)]">ساخت رزومه آنلاین</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          رزومه حرفه‌ای خود را بسازید و خروجی PDF بگیرید. تمام پردازش‌ها در مرورگر انجام می‌شود.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
            <h2 className="mb-3 text-lg font-bold text-[var(--text-primary)]">اطلاعات شخصی</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="نام و نام خانوادگی"
                value={resume.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                aria-label="نام و نام خانوادگی"
                className={inputClass}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="email"
                  placeholder="ایمیل"
                  value={resume.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  aria-label="ایمیل"
                  className={inputClass}
                />
                <input
                  type="tel"
                  placeholder="تلفن"
                  dir="ltr"
                  value={resume.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  aria-label="تلفن"
                  className={inputClass}
                />
              </div>
              <textarea
                placeholder="خلاصه حرفه‌ای..."
                rows={3}
                value={resume.summary}
                onChange={(e) => updateField('summary', e.target.value)}
                className={inputClass}
              />
            </div>
          </section>

          <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">سوابق تحصیلی</h2>
              <button
                type="button"
                onClick={addEducation}
                className="rounded-md bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20"
              >
                + اضافه
              </button>
            </div>
            <div className="space-y-3">
              {resume.education.map((edu, i) => (
                <div
                  key={i}
                  className="space-y-2 rounded-md border border-[var(--border-light)] p-3"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="مدرسه/دانشگاه"
                      value={edu.school}
                      onChange={(e) => updateEducation(i, 'school', e.target.value)}
                      aria-label="مدرسه/دانشگاه"
                      className={inputClass}
                    />
                    <input
                      placeholder="مدرک/رشته"
                      value={edu.degree}
                      onChange={(e) => updateEducation(i, 'degree', e.target.value)}
                      aria-label="مدرک/رشته"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      placeholder="سال"
                      value={edu.year}
                      onChange={(e) => updateEducation(i, 'year', e.target.value)}
                      aria-label="سال تحصیل"
                      className={inputClass}
                    />
                    {resume.education.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEducation(i)}
                        className="rounded-md bg-[var(--color-danger)]/10 px-3 py-1 text-xs text-[var(--color-danger)]"
                      >
                        حذف
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">سابقه کاری</h2>
              <button
                type="button"
                onClick={addExperience}
                className="rounded-md bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20"
              >
                + اضافه
              </button>
            </div>
            <div className="space-y-3">
              {resume.experience.map((exp, i) => (
                <div
                  key={i}
                  className="space-y-2 rounded-md border border-[var(--border-light)] p-3"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="شرکت"
                      value={exp.company}
                      onChange={(e) => updateExperience(i, 'company', e.target.value)}
                      aria-label="شرکت"
                      className={inputClass}
                    />
                    <input
                      placeholder="سمت"
                      value={exp.role}
                      onChange={(e) => updateExperience(i, 'role', e.target.value)}
                      aria-label="سمت شغلی"
                      className={inputClass}
                    />
                  </div>
                  <input
                    placeholder="دوره (مثلاً ۱۴۰۱-۱۴۰۴)"
                    value={exp.period}
                    onChange={(e) => updateExperience(i, 'period', e.target.value)}
                    aria-label="دوره کاری"
                    className={inputClass}
                  />
                  <textarea
                    placeholder="توضیحات وظایف..."
                    rows={2}
                    value={exp.description}
                    onChange={(e) => updateExperience(i, 'description', e.target.value)}
                    aria-label="توضیحات وظایف"
                    className={inputClass}
                  />
                  {resume.experience.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExperience(i)}
                      className="rounded-md bg-[var(--color-danger)]/10 px-3 py-1 text-xs text-[var(--color-danger)]"
                    >
                      حذف
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
            <h2 className="mb-3 text-lg font-bold text-[var(--text-primary)]">مهارت‌ها</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="مهارت جدید"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                aria-label="مهارت جدید"
                className={inputClass}
              />
              <button
                type="button"
                onClick={addSkill}
                className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]"
              >
                اضافه
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {resume.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-primary)]"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    aria-label={`حذف ${skill}`}
                    className="mr-1 text-[var(--color-danger)]"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </section>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--color-primary-hover)]"
            >
              {showPreview ? 'ویرایش' : 'پیش‌نمایش'}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-lg border border-[var(--border-light)] bg-[var(--surface-1)] px-6 py-3 text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
            >
              چاپ/دانلود PDF
            </button>
          </div>
        </div>

        <div className={`${showPreview ? '' : 'hidden lg:block'}`}>
          <div className="sticky top-4">
            <h3 className="mb-3 text-sm font-bold text-[var(--text-muted)]">پیش‌نمایش رزومه</h3>
            <div
              ref={resumeRef}
              className="rounded-lg border border-[var(--border-light)] bg-[var(--surface-1)] p-6 text-sm shadow-lg"
              style={{ fontFamily: "'Vazirmatn', 'Tahoma', sans-serif", direction: 'rtl' }}
            >
              {resume.fullName && (
                <h1 className="mb-2 text-xl font-black text-[var(--color-primary)]">
                  {resume.fullName}
                </h1>
              )}
              {(resume.email || resume.phone) && (
                <div className="mb-4 flex gap-4 text-xs text-[var(--text-muted)]">
                  {resume.email && <span>{resume.email}</span>}
                  {resume.phone && <span dir="ltr">{resume.phone}</span>}
                </div>
              )}
              {resume.summary && (
                <p className="mb-4 text-[var(--text-secondary)] leading-7">{resume.summary}</p>
              )}
              {resume.education.some((e) => e.school) && (
                <div className="mb-4">
                  <h2 className="mb-2 border-b border-[var(--color-primary)]/20 pb-1 text-sm font-bold text-[var(--color-primary)]">
                    سوابق تحصیلی
                  </h2>
                  {resume.education
                    .filter((e) => e.school)
                    .map((edu, i) => (
                      <div key={i} className="mb-2">
                        <div className="font-bold">{edu.school}</div>
                        <div className="text-xs text-[var(--text-muted)]">
                          {edu.degree} {edu.year && `— ${edu.year}`}
                        </div>
                      </div>
                    ))}
                </div>
              )}
              {resume.experience.some((e) => e.company) && (
                <div className="mb-4">
                  <h2 className="mb-2 border-b border-[var(--color-primary)]/20 pb-1 text-sm font-bold text-[var(--color-primary)]">
                    سابقه کاری
                  </h2>
                  {resume.experience
                    .filter((e) => e.company)
                    .map((exp, i) => (
                      <div key={i} className="mb-2">
                        <div className="font-bold">
                          {exp.role} — {exp.company}
                        </div>
                        {exp.period && (
                          <div className="text-xs text-[var(--text-muted)]">{exp.period}</div>
                        )}
                        {exp.description && (
                          <div className="mt-1 text-xs text-[var(--text-secondary)] leading-6">
                            {exp.description}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
              {resume.skills.length > 0 && (
                <div>
                  <h2 className="mb-2 border-b border-[var(--color-primary)]/20 pb-1 text-sm font-bold text-[var(--color-primary)]">
                    مهارت‌ها
                  </h2>
                  <div className="flex flex-wrap gap-1">
                    {resume.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs text-[var(--color-primary)]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
