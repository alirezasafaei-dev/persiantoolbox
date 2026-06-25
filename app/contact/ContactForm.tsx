'use client';

import { useState, type FormEvent } from 'react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const entry = {
      name,
      email,
      message,
      date: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem('contact-messages') ?? '[]');
    existing.push(entry);
    localStorage.setItem('contact-messages', JSON.stringify(existing));
    setName('');
    setEmail('');
    setMessage('');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="contact-name"
          className="mb-1 block text-sm font-semibold text-[var(--text-primary)]"
        >
          نام
        </label>
        <input
          id="contact-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)]"
        />
      </div>

      <div>
        <label
          htmlFor="contact-email"
          className="mb-1 block text-sm font-semibold text-[var(--text-primary)]"
        >
          ایمیل
        </label>
        <input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)]"
        />
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="mb-1 block text-sm font-semibold text-[var(--text-primary)]"
        >
          پیام
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)] resize-y"
        />
      </div>

      <button
        type="submit"
        className="rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity"
      >
        ارسال پیام
      </button>

      {saved && <p className="text-sm text-[var(--color-success)]">پیام شما با موفقیت ذخیره شد.</p>}
    </form>
  );
}
