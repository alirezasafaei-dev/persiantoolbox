'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui';
import Button from '@/shared/ui/Button';

const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  persian: 'ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی',
} as const;

type CharsetKey = keyof typeof CHARSETS;

function generatePassword(length: number, charsets: CharsetKey[]): string {
  const crypto = window.crypto;
  let pool = '';
  for (const key of charsets) {
    pool += CHARSETS[key];
  }
  if (!pool) {
    return '';
  }

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (n) => pool[n % pool.length]).join('');
}

function calculateStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) {
    score++;
  }
  if (password.length >= 12) {
    score++;
  }
  if (password.length >= 16) {
    score++;
  }
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++;
  }
  if (/\d/.test(password)) {
    score++;
  }
  if (/[^a-zA-Z0-9]/.test(password)) {
    score++;
  }
  if (/[ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی]/.test(password)) {
    score++;
  }

  if (score <= 2) {
    return { score, label: 'ضعیف', color: 'text-red-500' };
  }
  if (score <= 4) {
    return { score, label: 'متوسط', color: 'text-yellow-500' };
  }
  if (score <= 5) {
    return { score, label: 'قوی', color: 'text-green-500' };
  }
  return { score, label: 'بسیار قوی', color: 'text-green-600' };
}

export default function PersianPasswordGenerator() {
  const [length, setLength] = useState(16);
  const [selectedCharsets, setSelectedCharsets] = useState<CharsetKey[]>([
    'uppercase',
    'lowercase',
    'numbers',
  ]);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    const pwd = generatePassword(length, selectedCharsets);
    setPassword(pwd);
    setCopied(false);
  }, [length, selectedCharsets]);

  const toggleCharset = useCallback((key: CharsetKey) => {
    setSelectedCharsets((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key],
    );
  }, []);

  const copyToClipboard = useCallback(() => {
    if (password) {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [password]);

  const strength = password ? calculateStrength(password) : null;

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">تولید رمز عبور قوی</h2>
        <p className="text-sm text-[var(--text-muted)]">
          رمز عبور قوی با کاراکترهای فارسی و انگلیسی تولید کنید. تمام پردازش‌ها محلی است.
        </p>

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            طول رمز عبور: {length}
          </label>
          <input
            type="range"
            min="8"
            max="64"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-[var(--text-muted)]">
            <span>۸</span>
            <span>۶۴</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-[var(--text-primary)]">
            نوع کاراکترها
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(CHARSETS).map((key) => (
              <button
                key={key}
                onClick={() => toggleCharset(key as CharsetKey)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCharsets.includes(key as CharsetKey)
                    ? 'bg-[var(--color-primary)] text-[var(--text-inverted)]'
                    : 'bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]'
                }`}
              >
                {key === 'uppercase' && 'حروف بزرگ'}
                {key === 'lowercase' && 'حروف کوچک'}
                {key === 'numbers' && 'اعداد'}
                {key === 'symbols' && 'نمادها'}
                {key === 'persian' && 'فارسی'}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={generate} fullWidth>
          تولید رمز عبور
        </Button>
      </Card>

      {password && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">رمز عبور تولید شده</h3>
            <Button variant="secondary" onClick={copyToClipboard}>
              {copied ? 'کپی شد ✓' : 'کپی'}
            </Button>
          </div>
          <div className="p-4 bg-[var(--surface-2)] rounded-lg font-mono text-sm break-all text-[var(--text-primary)] select-all">
            {password}
          </div>
          {strength && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-muted)]">قدرت:</span>
              <span className={`text-sm font-bold ${strength.color}`}>{strength.label}</span>
              <div className="flex-1 bg-[var(--surface-2)] rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${(strength.score / 7) * 100}%`,
                    backgroundColor:
                      strength.score <= 2 ? '#ef4444' : strength.score <= 4 ? '#eab308' : '#22c55e',
                  }}
                />
              </div>
            </div>
          )}
          <p className="text-xs text-[var(--text-muted)]">{password.length} کاراکتر</p>
        </Card>
      )}
    </div>
  );
}
