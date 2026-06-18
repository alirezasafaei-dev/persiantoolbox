'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui';


type Stats = {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
};

function analyzeText(text: string): Stats {
  if (!text.trim()) {
    return {
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      lines: 0,
    };
  }
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const sentences = text.split(/[.!?؟]+/).filter((s) => s.trim()).length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim()).length || 1;
  const lines = text.split('\n').length;
  return { characters, charactersNoSpaces, words, sentences, paragraphs, lines };
}

export default function WordCounterPage() {
  const [text, setText] = useState('');
  const stats = useMemo(() => analyzeText(text), [text]);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-primary-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            شمارنده کلمات و کاراکترها
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            متن خود را وارد کنید و آمار کلمات، جملات، پاراگراف‌ها و کاراکترها را به‌صورت آنی ببینید.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-[var(--text-muted)]">
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1">
              پردازش آنی
            </span>
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1">
              بدون ارسال به سرور
            </span>
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1">
              پشتیبانی از فارسی و انگلیسی
            </span>
          </div>
        </div>
      </section>

      <Card className="p-6 space-y-4">
        <label
          htmlFor="word-counter-input"
          className="text-sm font-semibold text-[var(--text-primary)]"
        >
          متن خود را وارد کنید
        </label>
        <textarea
          id="word-counter-input"
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="متن خود را اینجا بنویسید یا paste کنید..."
          className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 resize-y"
          aria-label="ورودی متن برای شمارش"
        />
      </Card>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'کاراکترها', value: stats.characters, icon: '📝' },
          { label: 'بدون فاصله', value: stats.charactersNoSpaces, icon: '🔤' },
          { label: 'کلمات', value: stats.words, icon: '📚' },
          { label: 'جملات', value: stats.sentences, icon: '📖' },
          { label: 'پاراگراف‌ها', value: stats.paragraphs, icon: '📄' },
          { label: 'خط‌ها', value: stats.lines, icon: '📋' },
        ].map((stat) => (
          <Card key={stat.label} className="p-4 text-center">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">
              {stat.value.toLocaleString('fa')}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">{stat.label}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
