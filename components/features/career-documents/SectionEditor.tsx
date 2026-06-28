'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui';
import type {
  ResumeExperience,
  ResumeEducation,
  ResumeSkill,
  ResumeLanguage,
  ResumeProject,
  ResumeCertification,
} from '@/lib/career-documents/types';
import {
  createEmptyExperience,
  createEmptyEducation,
  createEmptySkill,
  createEmptyLanguage,
  createEmptyProject,
  createEmptyCertification,
} from '@/lib/career-documents/calculations';

export type SectionType =
  | 'experience'
  | 'education'
  | 'skills'
  | 'languages'
  | 'projects'
  | 'certifications';

type SectionItem =
  | ResumeExperience
  | ResumeEducation
  | ResumeSkill
  | ResumeLanguage
  | ResumeProject
  | ResumeCertification;

interface SectionEditorProps {
  sectionType: SectionType;
  items: SectionItem[];
  onUpdate: (items: SectionItem[]) => void;
  errors: string[];
}

const SKILL_LEVELS = ['مبتدی', 'متوسط', 'پیشرفته', 'حرفه‌ای'] as const;
const LANGUAGE_LEVELS = ['مبتدی', 'متوسط', 'خوب', 'عالی', 'مادری'] as const;
const DEGREE_OPTIONS = ['دیپلم', 'کاردانی', 'کارشناسی', 'کارشناسی ارشد', 'دکترا', 'other'] as const;

const SECTION_LABELS: Record<SectionType, string> = {
  experience: 'سوابق شغلی',
  education: 'تحصیلات',
  skills: 'مهارت‌ها',
  languages: 'زبان‌ها',
  projects: 'پروژه‌ها / نمونه‌کارها',
  certifications: 'گواهینامه‌ها و افتخارات',
};

const CREATE_EMPTY: Record<SectionType, () => SectionItem> = {
  experience: createEmptyExperience,
  education: createEmptyEducation,
  skills: createEmptySkill,
  languages: createEmptyLanguage,
  projects: createEmptyProject,
  certifications: createEmptyCertification,
};

function getInputClasses() {
  return 'w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]';
}

function getSelectClasses() {
  return 'w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]';
}

function renderExperienceFields(
  item: ResumeExperience,
  onUpdate: (id: string, field: string, value: string | boolean) => void,
) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="space-y-1">
        <label className="block text-xs font-medium text-[var(--text-secondary)]">نام شرکت *</label>
        <input
          type="text"
          value={item.company}
          onChange={(e) => onUpdate(item.id, 'company', e.target.value)}
          placeholder="نام شرکت"
          className={getInputClasses()}
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-[var(--text-secondary)]">سمت شغلی *</label>
        <input
          type="text"
          value={item.position}
          onChange={(e) => onUpdate(item.id, 'position', e.target.value)}
          placeholder="مثلاً: توسعه‌دهنده ارشد"
          className={getInputClasses()}
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-[var(--text-secondary)]">تاریخ شروع</label>
        <input
          type="date"
          value={item.startDate}
          onChange={(e) => onUpdate(item.id, 'startDate', e.target.value)}
          className={getInputClasses()}
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-[var(--text-secondary)]">
          تاریخ پایان
        </label>
        <input
          type="date"
          value={item.endDate ?? ''}
          onChange={(e) => onUpdate(item.id, 'endDate', e.target.value)}
          disabled={item.isCurrent}
          className={getInputClasses()}
        />
      </div>
      <div className="flex items-center gap-2 md:col-span-2">
        <input
          type="checkbox"
          id={`current-${item.id}`}
          checked={item.isCurrent ?? false}
          onChange={(e) => onUpdate(item.id, 'isCurrent', e.target.checked)}
          className="h-4 w-4 rounded border-[var(--border-light)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
        />
        <label htmlFor={`current-${item.id}`} className="text-sm text-[var(--text-secondary)]">
          مشغول به کار در حال حاضر
        </label>
      </div>
      <div className="space-y-1 md:col-span-2">
        <label className="block text-xs font-medium text-[var(--text-secondary)]">توضیحات</label>
        <textarea
          value={item.description}
          onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
          placeholder="شرح وظایف و دستاوردها (هر خط = یک آیتم)"
          rows={4}
          className={`${getInputClasses()} resize-none`}
        />
      </div>
    </div>
  );
}

function renderEducationFields(
  item: ResumeEducation,
  onUpdate: (id: string, field: string, value: string) => void,
) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="space-y-1">
        <label className="block text-xs font-medium text-[var(--text-secondary)]">
          نام مؤسسه *
        </label>
        <input
          type="text"
          value={item.institution}
          onChange={(e) => onUpdate(item.id, 'institution', e.target.value)}
          placeholder="نام دانشگاه / مؤسسه"
          className={getInputClasses()}
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-[var(--text-secondary)]">مدرک</label>
        <select
          value={item.degree}
          onChange={(e) => onUpdate(item.id, 'degree', e.target.value)}
          className={getSelectClasses()}
        >
          <option value="">انتخاب کنید</option>
          {DEGREE_OPTIONS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-[var(--text-secondary)]">
          رشته تحصیلی
        </label>
        <input
          type="text"
          value={item.field}
          onChange={(e) => onUpdate(item.id, 'field', e.target.value)}
          placeholder="مثلاً: مهندسی کامپیوتر"
          className={getInputClasses()}
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-[var(--text-secondary)]">تاریخ شروع</label>
        <input
          type="date"
          value={item.startDate}
          onChange={(e) => onUpdate(item.id, 'startDate', e.target.value)}
          className={getInputClasses()}
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-[var(--text-secondary)]">
          تاریخ پایان
        </label>
        <input
          type="date"
          value={item.endDate ?? ''}
          onChange={(e) => onUpdate(item.id, 'endDate', e.target.value)}
          className={getInputClasses()}
        />
      </div>
      <div className="space-y-1 md:col-span-2">
        <label className="block text-xs font-medium text-[var(--text-secondary)]">توضیحات</label>
        <textarea
          value={item.description ?? ''}
          onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
          placeholder="توضیحات اختیاری"
          rows={3}
          className={`${getInputClasses()} resize-none`}
        />
      </div>
    </div>
  );
}

function renderSkillFields(
  item: ResumeSkill,
  onUpdate: (id: string, field: string, value: string) => void,
) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="space-y-1">
        <label className="block text-xs font-medium text-[var(--text-secondary)]">نام مهارت</label>
        <input
          type="text"
          value={item.name}
          onChange={(e) => onUpdate(item.id, 'name', e.target.value)}
          placeholder="مثلاً: TypeScript"
          className={getInputClasses()}
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-[var(--text-secondary)]">سطح</label>
        <select
          value={item.level ?? 'متوسط'}
          onChange={(e) => onUpdate(item.id, 'level', e.target.value)}
          className={getSelectClasses()}
        >
          {SKILL_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function renderLanguageFields(
  item: ResumeLanguage,
  onUpdate: (id: string, field: string, value: string) => void,
) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="space-y-1">
        <label className="block text-xs font-medium text-[var(--text-secondary)]">نام زبان</label>
        <input
          type="text"
          value={item.name}
          onChange={(e) => onUpdate(item.id, 'name', e.target.value)}
          placeholder="مثلاً: انگلیسی"
          className={getInputClasses()}
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-[var(--text-secondary)]">سطح</label>
        <select
          value={item.level ?? 'متوسط'}
          onChange={(e) => onUpdate(item.id, 'level', e.target.value)}
          className={getSelectClasses()}
        >
          {LANGUAGE_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function renderProjectFields(
  item: ResumeProject,
  onUpdate: (id: string, field: string, value: string) => void,
) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="space-y-1">
        <label className="block text-xs font-medium text-[var(--text-secondary)]">نام پروژه</label>
        <input
          type="text"
          value={item.name}
          onChange={(e) => onUpdate(item.id, 'name', e.target.value)}
          placeholder="نام پروژه"
          className={getInputClasses()}
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-[var(--text-secondary)]">لینک</label>
        <input
          type="url"
          value={item.url ?? ''}
          onChange={(e) => onUpdate(item.id, 'url', e.target.value)}
          placeholder="https://..."
          dir="ltr"
          className={getInputClasses()}
        />
      </div>
      <div className="space-y-1 md:col-span-2">
        <label className="block text-xs font-medium text-[var(--text-secondary)]">
          تکنولوژی‌ها
        </label>
        <input
          type="text"
          value={item.technologies ?? ''}
          onChange={(e) => onUpdate(item.id, 'technologies', e.target.value)}
          placeholder="React, Node.js, PostgreSQL"
          dir="ltr"
          className={getInputClasses()}
        />
      </div>
      <div className="space-y-1 md:col-span-2">
        <label className="block text-xs font-medium text-[var(--text-secondary)]">توضیحات</label>
        <textarea
          value={item.description ?? ''}
          onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
          placeholder="توضیح مختصر پروژه"
          rows={3}
          className={`${getInputClasses()} resize-none`}
        />
      </div>
    </div>
  );
}

function renderCertificationFields(
  item: ResumeCertification,
  onUpdate: (id: string, field: string, value: string) => void,
) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="space-y-1">
        <label className="block text-xs font-medium text-[var(--text-secondary)]">
          نام گواهینامه
        </label>
        <input
          type="text"
          value={item.name}
          onChange={(e) => onUpdate(item.id, 'name', e.target.value)}
          placeholder="نام گواهینامه یا دوره"
          className={getInputClasses()}
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-[var(--text-secondary)]">
          سازمان صادرکننده
        </label>
        <input
          type="text"
          value={item.issuer ?? ''}
          onChange={(e) => onUpdate(item.id, 'issuer', e.target.value)}
          placeholder="مثلاً: AWS, Google"
          className={getInputClasses()}
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-[var(--text-secondary)]">تاریخ</label>
        <input
          type="date"
          value={item.date ?? ''}
          onChange={(e) => onUpdate(item.id, 'date', e.target.value)}
          className={getInputClasses()}
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-[var(--text-secondary)]">لینک</label>
        <input
          type="url"
          value={item.url ?? ''}
          onChange={(e) => onUpdate(item.id, 'url', e.target.value)}
          placeholder="https://..."
          dir="ltr"
          className={getInputClasses()}
        />
      </div>
    </div>
  );
}

export default function SectionEditor({
  sectionType,
  items,
  onUpdate,
  errors,
}: SectionEditorProps) {
  const addItem = useCallback(() => {
    const newItem = CREATE_EMPTY[sectionType]();
    onUpdate([...items, newItem] as SectionItem[]);
  }, [sectionType, items, onUpdate]);

  const removeItem = useCallback(
    (id: string) => {
      onUpdate(items.filter((item) => item.id !== id));
    },
    [items, onUpdate],
  );

  const updateItem = useCallback(
    (id: string, field: string, value: string | boolean) => {
      onUpdate(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    },
    [items, onUpdate],
  );

  const renderFields = (item: SectionItem) => {
    switch (sectionType) {
      case 'experience':
        return renderExperienceFields(item as ResumeExperience, updateItem);
      case 'education':
        return renderEducationFields(item as ResumeEducation, updateItem);
      case 'skills':
        return renderSkillFields(item as ResumeSkill, updateItem);
      case 'languages':
        return renderLanguageFields(item as ResumeLanguage, updateItem);
      case 'projects':
        return renderProjectFields(item as ResumeProject, updateItem);
      case 'certifications':
        return renderCertificationFields(item as ResumeCertification, updateItem);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-[var(--text-primary)]">
        {SECTION_LABELS[sectionType]}
      </h2>

      {errors.length > 0 && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 p-3">
          {errors.map((e, i) => (
            <p key={i} className="text-xs text-[var(--color-danger)]" role="alert">
              {e}
            </p>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--text-muted)]">
                {SECTION_LABELS[sectionType]} {idx + 1}
              </span>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-[var(--color-danger)] hover:text-[var(--color-danger)]/80 text-sm font-bold p-1"
                  aria-label="حذف"
                >
                  ✕
                </button>
              )}
            </div>
            {renderFields(item)}
          </div>
        ))}
      </div>

      <Button variant="tertiary" size="sm" onClick={addItem}>
        + افزودن {SECTION_LABELS[sectionType]}
      </Button>
    </div>
  );
}
