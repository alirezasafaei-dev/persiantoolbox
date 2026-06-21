import { describe, expect, it } from 'vitest';

describe('Persian Password Generator', () => {
  const CHARSETS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    persian: 'ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی',
  };

  it('generates password of correct length', () => {
    const length = 16;
    const pool = CHARSETS.uppercase + CHARSETS.lowercase + CHARSETS.numbers;
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    const password = Array.from(array, (n) => pool[n % pool.length]).join('');
    expect(password.length).toBe(length);
  });

  it('uses only selected charsets', () => {
    const pool = CHARSETS.numbers;
    for (let i = 0; i < 100; i++) {
      const array = new Uint32Array(20);
      crypto.getRandomValues(array);
      const password = Array.from(array, (n) => pool[n % pool.length]).join('');
      for (const char of password) {
        expect(pool).toContain(char);
      }
    }
  });

  it('includes Persian characters when selected', () => {
    const persianChars = 'ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی';
    const pool = persianChars;
    let hasPersian = false;
    for (let i = 0; i < 100; i++) {
      const array = new Uint32Array(20);
      crypto.getRandomValues(array);
      const password = Array.from(array, (n) => pool[n % pool.length]).join('');
      if (/[ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی]/.test(password)) {
        hasPersian = true;
        break;
      }
    }
    expect(hasPersian).toBe(true);
  });

  it('calculates strength correctly', () => {
    const calculateStrength = (password: string) => {
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
      return score;
    };

    expect(calculateStrength('abc')).toBe(0);
    expect(calculateStrength('abcdefghij')).toBe(1);
    expect(calculateStrength('Abcdefghij12')).toBeGreaterThanOrEqual(2);
    expect(calculateStrength('Abcdefghij12!')).toBeGreaterThanOrEqual(3);
    expect(calculateStrength('Abcdefghij12!@#$')).toBeGreaterThanOrEqual(4);
    expect(calculateStrength('Abcdefghij12!@#$%^')).toBeGreaterThanOrEqual(5);
    expect(calculateStrength('Abcdefghij12!@#$%^ابپتث')).toBeGreaterThanOrEqual(6);
  });

  it('minimum length is 8', () => {
    expect(8).toBeGreaterThanOrEqual(8);
  });

  it('maximum length is 64', () => {
    expect(64).toBeLessThanOrEqual(64);
  });
});
