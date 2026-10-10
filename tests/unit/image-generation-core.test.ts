import { describe, it, expect } from 'vitest';
import { randomBytes } from 'node:crypto';
import {
  decrypt,
  encrypt,
  keyFromEnv,
  newSession,
  ownerFromCookie,
  validatePrompt,
  identifyImage,
  validId,
} from '../../services/image-generation/core.mjs';
describe('image generation trust boundaries', () => {
  const key = randomBytes(32);
  it('requires a complete separate encryption key', () => {
    expect(() => keyFromEnv(undefined)).toThrow();
    expect(() => keyFromEnv('placeholder')).toThrow();
    expect(keyFromEnv(key.toString('base64'))).toEqual(key);
  });
  it('rejects forged, expired and wrong-key guest cookies', () => {
    const session = newSession(key, 1700000000000);
    expect(ownerFromCookie(session, key, 1700000000001)).toMatch(/^[a-f0-9]{64}$/);
    expect(ownerFromCookie(session, randomBytes(32), 1700000000001)).toBeNull();
    expect(ownerFromCookie(session, key, 1700086400000)).toBeNull();
    expect(ownerFromCookie(session.replace(/.$/, 'z'), key, 1700000000001)).toBeNull();
  });
  it('encrypts Persian text and binds it to the exact job and field', () => {
    const bytes = Buffer.from('یک قوری فیروزه‌ای');
    const ciphertext = encrypt(bytes, key, 'job:prompt');
    expect(ciphertext.includes(bytes)).toBe(false);
    expect(decrypt(ciphertext, key, 'job:prompt')).toEqual(bytes);
    expect(() => decrypt(ciphertext, key, 'other:prompt')).toThrow();
    const damaged = Buffer.from(ciphertext);
    damaged[30] = (damaged[30] ?? 0) ^ 1;
    expect(() => decrypt(damaged, key, 'job:prompt')).toThrow();
  });
  it('rejects invalid prompts, ids and disguised output', () => {
    expect(validatePrompt(' یک قوری فیروزه‌ای ')).toBe('یک قوری فیروزه‌ای');
    expect(() => validatePrompt('a'.repeat(2001))).toThrow();
    expect(() => validatePrompt('test\0bad input')).toThrow();
    expect(() => identifyImage(Buffer.from('<html>'.repeat(20)))).toThrow();
    expect(validId('../other')).toBe(false);
    expect(validId('3d3639bd-3a79-4c65-b4cb-e83acedd3a0e')).toBe(true);
  });
});
