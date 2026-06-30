'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';

const STORAGE_KEY = 'persiantoolbox.feedback.v1';
const SHOWN_KEY = 'persiantoolbox.feedback.shown.v1';

type FeedbackState = 'hidden' | 'shown' | 'submitted';

const questions = [
  {
    id: 'satisfaction',
    question: 'از ابزارهای PersianToolbox چقدر راضی هستید؟',
    options: ['خیلی راضی', 'راضی', 'متوسط', 'ناراضی'],
  },
  {
    id: 'most-used',
    question: 'کدام دسته ابزارها را بیشتر استفاده می‌کنید؟',
    options: ['ابزارهای مالی', 'ابزارهای PDF', 'ابزارهای تصویر', 'ابزارهای متنی', 'ابزارهای تاریخ'],
  },
  {
    id: 'improvement',
    question: 'چه چیزی بیشتر از همه نیاز به بهبود دارد؟',
    options: ['سرعت', 'دقت محاسبات', 'طراحی', 'تنوع ابزارها', 'راهنمای فارسی'],
  },
];

export default function FeedbackSurvey() {
  const [state, setState] = useState<FeedbackState>('hidden');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const shown = localStorage.getItem(SHOWN_KEY);
    if (shown) {
      return;
    }
    const USAGE_KEY = 'persiantoolbox.usage.count';
    let usageCount = 0;
    try {
      usageCount = parseInt(localStorage.getItem(USAGE_KEY) ?? '0', 10);
    } catch {
      // ignore
    }
    if (usageCount < 3) {
      return;
    }
    const timer = setTimeout(() => {
      setState('shown');
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    if (currentQ < questions.length - 1) {
      setCurrentQ((prev) => prev + 1);
    } else {
      const feedback = {
        answers: { ...answers, [questionId]: answer },
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(feedback));
      localStorage.setItem(SHOWN_KEY, 'true');
      setSubmitted(true);
      setTimeout(() => setState('hidden'), 3000);
    }
  };

  const handleClose = () => {
    localStorage.setItem(SHOWN_KEY, 'true');
    setState('hidden');
  };

  if (state !== 'shown') {
    return null;
  }

  const q = questions[currentQ];
  if (!q) {
    return null;
  }

  return (
    <div className="fixed bottom-4 start-4 z-50 max-w-sm w-full" role="dialog" aria-label="نظرسنجی">
      <Card className="p-5 shadow-[var(--shadow-strong)] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">نظرسنجی سریع</h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
            aria-label="بستن"
          >
            ×
          </button>
        </div>

        {submitted ? (
          <p className="text-sm text-[var(--color-success)] font-semibold text-center py-4">
            ممنون از نظر شما!
          </p>
        ) : (
          <>
            <div className="flex gap-1">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${
                    i <= currentQ ? 'bg-[var(--color-primary)]' : 'bg-[var(--bg-subtle)]'
                  }`}
                />
              ))}
            </div>

            <p className="text-sm font-semibold text-[var(--text-primary)]">{q.question}</p>

            <div className="space-y-2">
              {q.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleAnswer(q.id, option)}
                  className={[
                    'w-full text-right px-3 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-all',
                    'focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2',
                    answers[q.id] === option
                      ? 'bg-[var(--color-primary)] text-[var(--text-inverted)]'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]',
                  ].join(' ')}
                >
                  {option}
                </button>
              ))}
            </div>

            <p className="text-xs text-[var(--text-muted)] text-center">
              {currentQ + 1} از {questions.length}
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
