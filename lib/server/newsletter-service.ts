import { query } from './db';

export interface NewsletterService {
  subscribe(email: string): Promise<{ ok: boolean; alreadySubscribed?: boolean }>;
  unsubscribe(email: string): Promise<{ ok: boolean; notFound?: boolean }>;
  list(): Promise<{ email: string; subscribedAt: string }[]>;
  count(): Promise<number>;
}

class FileNewsletterService implements NewsletterService {
  private async readEmails(): Promise<string[]> {
    const pathMod = require('node:path');
    const fs = require('node:fs/promises');
    const filePath = pathMod.join(process.cwd(), '.data/newsletter-emails.json');
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  private async writeEmails(emails: string[]): Promise<void> {
    const pathMod = require('node:path');
    const fs = require('node:fs/promises');
    const filePath = pathMod.join(process.cwd(), '.data/newsletter-emails.json');
    await fs.mkdir(pathMod.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(emails, null, 2), 'utf-8');
  }

  async subscribe(email: string) {
    const normalized = email.trim().toLowerCase();
    const emails = await this.readEmails();
    if (emails.includes(normalized)) {
      return { ok: true as const, alreadySubscribed: true };
    }
    emails.push(normalized);
    await this.writeEmails(emails);
    return { ok: true as const };
  }

  async unsubscribe(email: string) {
    const normalized = email.trim().toLowerCase();
    const emails = await this.readEmails();
    const idx = emails.indexOf(normalized);
    if (idx === -1) {
      return { ok: false as const, notFound: true };
    }
    emails.splice(idx, 1);
    await this.writeEmails(emails);
    return { ok: true as const };
  }

  async list() {
    const emails = await this.readEmails();
    return emails.map((e) => ({ email: e, subscribedAt: 'unknown' }));
  }

  async count() {
    const emails = await this.readEmails();
    return emails.length;
  }
}

class DatabaseNewsletterService implements NewsletterService {
  async subscribe(email: string) {
    const normalized = email.trim().toLowerCase();
    const existing = await query<{ id: number }>(
      'SELECT id FROM newsletter_subscribers WHERE email = $1',
      [normalized],
    );
    if (existing.rows.length > 0) {
      return { ok: true as const, alreadySubscribed: true };
    }
    await query('INSERT INTO newsletter_subscribers (email) VALUES ($1)', [normalized]);
    return { ok: true as const };
  }

  async unsubscribe(email: string) {
    const normalized = email.trim().toLowerCase();
    const result = await query('DELETE FROM newsletter_subscribers WHERE email = $1', [normalized]);
    if (result.rowCount === 0) {
      return { ok: false as const, notFound: true };
    }
    return { ok: true as const };
  }

  async list() {
    const result = await query<{ email: string; subscribed_at: Date }>(
      'SELECT email, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC',
    );
    return result.rows.map((r) => ({
      email: r.email,
      subscribedAt: r.subscribed_at?.toISOString?.() ?? String(r.subscribed_at),
    }));
  }

  async count() {
    const result = await query<{ count: string | number }>(
      'SELECT COUNT(*) as count FROM newsletter_subscribers',
    );
    return Number(result.rows[0]?.count ?? 0);
  }
}

let instance: NewsletterService | null = null;

export function getNewsletterService(): NewsletterService {
  if (!instance) {
    instance = process.env['DATABASE_URL']
      ? new DatabaseNewsletterService()
      : new FileNewsletterService();
  }
  return instance;
}
