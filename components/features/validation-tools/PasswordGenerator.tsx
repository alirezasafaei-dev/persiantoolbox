'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';

export default function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [strength, setStrength] = useState(0);

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = '';
    if (includeUppercase) {
      chars += uppercase;
    }
    if (includeLowercase) {
      chars += lowercase;
    }
    if (includeNumbers) {
      chars += numbers;
    }
    if (includeSymbols) {
      chars += symbols;
    }

    if (chars === '') {
      return;
    }

    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setPassword(result);
  };

  useEffect(() => {
    calculateStrength();
  }, [password]);

  const calculateStrength = () => {
    let score = 0;
    if (password.length >= 8) {
      score += 1;
    }
    if (password.length >= 12) {
      score += 1;
    }
    if (password.length >= 16) {
      score += 1;
    }
    if (/[A-Z]/.test(password)) {
      score += 1;
    }
    if (/[a-z]/.test(password)) {
      score += 1;
    }
    if (/[0-9]/.test(password)) {
      score += 1;
    }
    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    }

    setStrength(Math.min(score, 4));
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(password);
  };

  const getStrengthColor = () => {
    switch (strength) {
      case 0:
        return 'bg-gray-300';
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-orange-500';
      case 3:
        return 'bg-yellow-500';
      case 4:
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStrengthText = () => {
    switch (strength) {
      case 0:
        return 'بسیار ضعیف';
      case 1:
        return 'ضعیف';
      case 2:
        return 'متوسط';
      case 3:
        return 'قوی';
      case 4:
        return 'بسیار قوی';
      default:
        return '-';
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-black text-[var(--text-primary)] mb-2">تولیدکننده رمز عبور</h3>
        <p className="text-sm text-[var(--text-muted)]">
          رمز عبور قوی و امن برای حساب‌های خود تولید کنید.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-semibold text-[var(--text-primary)]">
              طول رمز عبور: {length}
            </label>
          </div>
          <input
            type="range"
            min="8"
            max="64"
            value={length}
            onChange={(e) => setLength(Number.parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={includeUppercase}
              onChange={(e) => setIncludeUppercase(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-[var(--text-primary)]">حروف بزرگ (A-Z)</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={includeLowercase}
              onChange={(e) => setIncludeLowercase(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-[var(--text-primary)]">حروف کوچک (a-z)</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-[var(--text-primary)]">اعداد (0-9)</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-[var(--text-primary)]">نمادها (!@#$%^&*)</span>
          </label>
        </div>

        <button
          onClick={generatePassword}
          className="w-full bg-[var(--color-primary)] text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
        >
          تولید رمز عبور
        </button>

        {password && (
          <div className="space-y-3">
            <div className="p-3 rounded-md bg-[var(--surface-2)] border border-[var(--border-light)]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-[var(--text-muted)]">رمز عبور:</span>
                <button
                  onClick={copyPassword}
                  className="text-xs text-[var(--color-primary)] hover:underline"
                >
                  کپی
                </button>
              </div>
              <code className="text-sm text-[var(--text-primary)] break-all" dir="ltr">
                {password}
              </code>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-[var(--text-muted)]">قدرت رمز:</span>
                <span className="text-xs text-[var(--text-primary)]">{getStrengthText()}</span>
              </div>
              <div className="h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                  style={{ width: `${(strength / 4) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
