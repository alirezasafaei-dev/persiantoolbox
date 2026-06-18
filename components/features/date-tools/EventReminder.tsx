'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, Button } from '@/components/ui';

type Event = {
  id: string;
  title: string;
  date: string;
  description: string;
  createdAt: number;
};

const STORAGE_KEY = 'persian-tools.events.v1';

function loadEvents(): Event[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEvents(events: Event[]) {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function formatPersianDate(dateStr: string): string {
  if (!dateStr) {
    return '';
  }
  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    return dateStr;
  }
  const months = [
    'ژانویه',
    'فوریه',
    'مارس',
    'آوریه',
    'مه',
    'ژوئن',
    'ژوئیه',
    'اوت',
    'سپتامبر',
    'اکتبر',
    'نوامبر',
    'دسامبر',
  ];
  const monthIndex = parseInt(parts[1] ?? '0') - 1;
  return `${parseInt(parts[2] ?? '0')} ${months[monthIndex] ?? ''} ${parts[0] ?? ''}`;
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function EventReminderPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setEvents(loadEvents());
  }, []);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  const upcomingEvents = useMemo(() => {
    return sortedEvents.filter((e) => daysUntil(e.date) >= 0);
  }, [sortedEvents]);

  const pastEvents = useMemo(() => {
    return sortedEvents.filter((e) => daysUntil(e.date) < 0);
  }, [sortedEvents]);

  const addEvent = () => {
    if (!title || !date) {
      return;
    }
    const newEvent: Event = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title,
      date,
      description,
      createdAt: Date.now(),
    };
    const next = [...events, newEvent];
    setEvents(next);
    saveEvents(next);
    setTitle('');
    setDate('');
    setDescription('');
    setShowForm(false);
  };

  const removeEvent = (id: string) => {
    const next = events.filter((e) => e.id !== id);
    setEvents(next);
    saveEvents(next);
  };

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-warning-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            یادآوری رویدادها
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            رویدادهای مهم خود را ثبت کنید و تا روز رویداد یادآوری بگیرید. ذخیره در مرورگر.
          </p>
        </div>
      </section>

      <div className="flex justify-between items-center">
        <div className="text-sm text-[var(--text-muted)]">{events.length} رویداد ثبت شده</div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'بستن' : '+ افزودن رویداد'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">رویداد جدید</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="event-title" className="text-sm text-[var(--text-muted)]">
                عنوان رویداد
              </label>
              <input
                id="event-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: جلسه مهم"
                className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                aria-label="عنوان رویداد"
              />
            </div>
            <div>
              <label htmlFor="event-date" className="text-sm text-[var(--text-muted)]">
                تاریخ
              </label>
              <input
                id="event-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                aria-label="تاریخ رویداد"
              />
            </div>
          </div>
          <div>
            <label htmlFor="event-desc" className="text-sm text-[var(--text-muted)]">
              توضیحات (اختیاری)
            </label>
            <input
              id="event-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحات اضافی"
              className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-sm focus:border-[var(--color-primary)] focus:outline-none"
              aria-label="توضیحات رویداد"
            />
          </div>
          <Button onClick={addEvent} disabled={!title || !date}>
            افزودن
          </Button>
        </Card>
      )}

      {upcomingEvents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">رویدادهای آینده</h2>
          {upcomingEvents.map((event) => {
            const days = daysUntil(event.date);
            return (
              <Card key={event.id} className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-[var(--text-primary)]">{event.title}</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {formatPersianDate(event.date)}
                  </div>
                  {event.description && (
                    <div className="text-xs text-[var(--text-muted)]">{event.description}</div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${days === 0 ? 'bg-[var(--color-danger)] text-white' : days <= 7 ? 'bg-[var(--color-warning)] text-white' : 'bg-[var(--color-success)] text-white'}`}
                  >
                    {days === 0 ? 'امروز' : `${days} روز دیگر`}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeEvent(event.id)}
                    className="text-xs text-[var(--color-danger)] hover:underline"
                  >
                    حذف
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {pastEvents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-[var(--text-muted)]">رویدادهای گذشته</h2>
          {pastEvents.map((event) => (
            <Card key={event.id} className="p-4 opacity-60 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm font-bold text-[var(--text-primary)]">{event.title}</div>
                <div className="text-xs text-[var(--text-muted)]">
                  {formatPersianDate(event.date)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeEvent(event.id)}
                className="text-xs text-[var(--color-danger)] hover:underline"
              >
                حذف
              </button>
            </Card>
          ))}
        </div>
      )}

      {events.length === 0 && (
        <Card className="p-8 text-center space-y-4">
          <div className="text-4xl">📅</div>
          <p className="text-sm text-[var(--text-muted)]">هنوز رویدادی ثبت نشده است</p>
        </Card>
      )}
    </div>
  );
}
