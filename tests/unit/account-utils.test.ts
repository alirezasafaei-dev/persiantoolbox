import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateEmail,
  validatePassword,
  getPasswordStrength,
  getToolDisplayName,
  buildActivityTimeline,
  formatDate,
  formatDateShort,
  loadNotificationPrefs,
  saveNotificationPrefs,
  NOTIFICATION_STORAGE_KEY,
  type HistoryEntry,
  type UsageData,
} from '@/components/features/monetization/account-utils';

describe('Account Page Utilities', () => {
  describe('validateEmail', () => {
    it('returns error for empty email', () => {
      expect(validateEmail('')).toBe('ایمیل الزامی است');
      expect(validateEmail('  ')).toBe('ایمیل الزامی است');
    });

    it('returns error for invalid format', () => {
      expect(validateEmail('notanemail')).toBe('فرمت ایمیل صحیح نیست');
      expect(validateEmail('user@')).toBe('فرمت ایمیل صحیح نیست');
      expect(validateEmail('@domain.com')).toBe('فرمت ایمیل صحیح نیست');
    });

    it('returns null for valid email', () => {
      expect(validateEmail('user@example.com')).toBeNull();
      expect(validateEmail('test@domain.co')).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('returns error for empty password', () => {
      expect(validatePassword('')).toBe('رمز عبور الزامی است');
    });

    it('returns error for short password', () => {
      expect(validatePassword('Ab1')).toBe('رمز عبور باید حداقل ۸ کاراکتر باشد');
    });

    it('returns error for password without letters', () => {
      expect(validatePassword('12345678')).toBe('رمز عبور باید حداقل شامل یک حرف باشد');
    });

    it('returns error for password without numbers', () => {
      expect(validatePassword('abcdefgh')).toBe('رمز عبور باید حداقل شامل یک عدد باشد');
    });

    it('returns null for valid password', () => {
      expect(validatePassword('Abcdef12')).toBeNull();
      expect(validatePassword('StrongP4ss!')).toBeNull();
    });
  });

  describe('getPasswordStrength', () => {
    it('returns weak for very short password', () => {
      const result = getPasswordStrength('a1');
      expect(result.label).toBe('ضعیف');
      expect(result.score).toBeLessThanOrEqual(1);
    });

    it('returns strong for complex password', () => {
      const result = getPasswordStrength('MyStr0ng!Pass');
      expect(result.label).toBe('عالی');
      expect(result.score).toBeGreaterThanOrEqual(4);
    });

    it('increases score with length', () => {
      const short = getPasswordStrength('Ab1');
      const long = getPasswordStrength('Ab1cdefghij');
      expect(long.score).toBeGreaterThan(short.score);
    });

    it('increases score with special characters', () => {
      const noSpecial = getPasswordStrength('Abcdef12');
      const withSpecial = getPasswordStrength('Abcde!2');
      expect(withSpecial.score).toBeGreaterThanOrEqual(noSpecial.score);
    });
  });

  describe('getToolDisplayName', () => {
    it('returns Persian name for known tools', () => {
      expect(getToolDisplayName('/tools/currency-converter')).toBe('تبدیل ارز');
      expect(getToolDisplayName('/tools/tax-calculator')).toBe('محاسبه مالیات');
    });

    it('returns slug-based name for unknown tools', () => {
      expect(getToolDisplayName('/tools/my-custom-tool')).toBe('my custom tool');
    });
  });

  describe('buildActivityTimeline', () => {
    it('returns empty array for no data', () => {
      const result = buildActivityTimeline([], { lastUpdated: 0, totalViews: 0, paths: {} });
      expect(result).toEqual([]);
    });

    it('includes history entries', () => {
      const history: HistoryEntry[] = [
        {
          id: '1',
          tool: '/tools/currency-converter',
          inputSummary: '100 USD',
          outputSummary: '5000000 IRR',
          createdAt: Date.now(),
        },
      ];
      const result = buildActivityTimeline(history, { lastUpdated: 0, totalViews: 0, paths: {} });
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]?.title).toContain('تبدیل ارز');
    });

    it('includes usage paths', () => {
      const usage: UsageData = {
        lastUpdated: Date.now(),
        totalViews: 50,
        paths: { '/tools/tax-calculator': 10 },
      };
      const result = buildActivityTimeline([], usage);
      expect(result.length).toBeGreaterThan(0);
    });

    it('sorts by timestamp descending', () => {
      const history: HistoryEntry[] = [
        {
          id: '1',
          tool: '/tools/currency-converter',
          inputSummary: 'a',
          outputSummary: 'b',
          createdAt: 1000,
        },
        {
          id: '2',
          tool: '/tools/tax-calculator',
          inputSummary: 'c',
          outputSummary: 'd',
          createdAt: 5000,
        },
      ];
      const result = buildActivityTimeline(history, { lastUpdated: 0, totalViews: 0, paths: {} });
      expect(result[0]?.timestamp).toBeGreaterThanOrEqual(result[1]?.timestamp ?? 0);
    });

    it('limits to 10 items', () => {
      const history: HistoryEntry[] = Array.from({ length: 20 }, (_, i) => ({
        id: `id-${i}`,
        tool: '/tools/currency-converter',
        inputSummary: `${i}`,
        outputSummary: `${i}`,
        createdAt: Date.now() + i,
      }));
      const result = buildActivityTimeline(history, { lastUpdated: 0, totalViews: 0, paths: {} });
      expect(result.length).toBeLessThanOrEqual(10);
    });
  });

  describe('formatDate / formatDateShort', () => {
    it('formatDate includes time', () => {
      const result = formatDate(Date.now());
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('formatDateShort excludes time', () => {
      const result = formatDateShort(Date.now());
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('notification prefs', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('loadNotificationPrefs returns defaults when empty', () => {
      const prefs = loadNotificationPrefs();
      expect(prefs.emailNotifications).toBe(true);
      expect(prefs.historyReminders).toBe(true);
      expect(prefs.pushNotifications).toBe(false);
    });

    it('saveNotificationPrefs persists and loadNotificationPrefs reads', () => {
      saveNotificationPrefs({
        emailNotifications: false,
        historyReminders: false,
        pushNotifications: true,
      });
      const prefs = loadNotificationPrefs();
      expect(prefs.emailNotifications).toBe(false);
      expect(prefs.historyReminders).toBe(false);
      expect(prefs.pushNotifications).toBe(true);
    });

    it('handles corrupted localStorage gracefully', () => {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, 'invalid json{{{');
      const prefs = loadNotificationPrefs();
      expect(prefs.emailNotifications).toBe(true);
    });
  });
});
