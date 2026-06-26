'use client';

import { useCallback } from 'react';
import type React from 'react';
import type { ResumeProfile } from '@/lib/career-documents/types';
import Input from '@/shared/ui/Input';

type Props = {
  profile: ResumeProfile;
  errors: string[];
  onChange: (profile: ResumeProfile) => void;
  isPremium: boolean;
};

export default function ProfileForm({ profile, errors, onChange, isPremium }: Props) {
  const update = useCallback(
    (field: keyof ResumeProfile, value: string) => {
      onChange({ ...profile, [field]: value });
    },
    [profile, onChange],
  );

  const handlePhotoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        return;
      }
      if (!isPremium) {
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        onChange({ ...profile, photoDataUrl: dataUrl });
      };
      reader.readAsDataURL(file);
    },
    [profile, onChange, isPremium],
  );

  const removePhoto = useCallback(() => {
    const p: ResumeProfile = { fullName: profile.fullName };
    if (profile.email) {
      p.email = profile.email;
    }
    if (profile.phone) {
      p.phone = profile.phone;
    }
    if (profile.address) {
      p.address = profile.address;
    }
    if (profile.linkedin) {
      p.linkedin = profile.linkedin;
    }
    if (profile.github) {
      p.github = profile.github;
    }
    if (profile.portfolio) {
      p.portfolio = profile.portfolio;
    }
    if (profile.summary) {
      p.summary = profile.summary;
    }
    onChange(p);
  }, [profile, onChange]);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-light)] pb-2">
        اطلاعات فردی
      </h3>

      {errors.length > 0 && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 p-3">
          {errors.map((e, i) => (
            <p key={i} className="text-xs text-[var(--color-danger)]" role="alert">
              {e}
            </p>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          id="profile-fullName"
          label="نام کامل *"
          value={profile.fullName ?? ''}
          onChange={(e) => update('fullName', e.target.value)}
          placeholder="نام و نام خانوادگی"
        />
        <Input
          id="profile-email"
          label="ایمیل"
          value={profile.email ?? ''}
          onChange={(e) => update('email', e.target.value)}
          placeholder="email@example.com"
          dir="ltr"
          type="email"
        />
        <Input
          id="profile-phone"
          label="تلفن"
          value={profile.phone ?? ''}
          onChange={(e) => update('phone', e.target.value)}
          placeholder="۰۹۱۲۱۲۳۴۵۶۷"
          dir="ltr"
        />
        <Input
          id="profile-address"
          label="آدرس"
          value={profile.address ?? ''}
          onChange={(e) => update('address', e.target.value)}
          placeholder="شهر، کشور"
        />
        <Input
          id="profile-linkedin"
          label="لینکدین"
          value={profile.linkedin ?? ''}
          onChange={(e) => update('linkedin', e.target.value)}
          placeholder="https://linkedin.com/in/username"
          dir="ltr"
        />
        <Input
          id="profile-github"
          label="گیت‌هاب"
          value={profile.github ?? ''}
          onChange={(e) => update('github', e.target.value)}
          placeholder="https://github.com/username"
          dir="ltr"
        />
        <Input
          id="profile-portfolio"
          label="پورتفولیو"
          value={profile.portfolio ?? ''}
          onChange={(e) => update('portfolio', e.target.value)}
          placeholder="https://yoursite.com"
          dir="ltr"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--text-primary)]">
          عکس پروفایل {isPremium ? '' : '(پریمیوم)'}
        </label>
        {profile.photoDataUrl ? (
          <div className="flex items-center gap-4">
            <img
              src={profile.photoDataUrl}
              alt="عکس پروفایل"
              className="w-16 h-16 rounded-full object-cover border border-[var(--border-light)]"
            />
            <button
              type="button"
              onClick={removePhoto}
              className="text-xs text-[var(--color-danger)] hover:underline"
            >
              حذف عکس
            </button>
          </div>
        ) : (
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            disabled={!isPremium}
            className="text-sm text-[var(--text-muted)] file:mr-4 file:py-2 file:px-4 file:rounded-[var(--radius-md)] file:border-0 file:text-sm file:font-medium file:bg-[var(--surface-2)] file:text-[var(--text-primary)] hover:file:bg-[var(--surface-3)] disabled:opacity-50 disabled:cursor-not-allowed"
          />
        )}
      </div>
    </div>
  );
}
