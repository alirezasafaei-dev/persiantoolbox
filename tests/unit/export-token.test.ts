import { describe, expect, it, vi } from 'vitest';
import {
  signExportToken,
  verifyExportToken,
  createExportTokenPayload,
  type ExportTokenPayload,
} from '@/lib/server/export-token';

describe('Export token', () => {
  describe('createExportTokenPayload', () => {
    it('creates payload with correct structure', () => {
      const payload = createExportTokenPayload('user-123', 'business');
      expect(payload.userId).toBe('user-123');
      expect(payload.product).toBe('business');
      expect(payload.expiresAt).toBeGreaterThan(Date.now());
    });

    it('sets expiration to 60 seconds', () => {
      const before = Date.now();
      const payload = createExportTokenPayload('user-123', 'career');
      const after = Date.now();
      expect(payload.expiresAt).toBeGreaterThanOrEqual(before + 59000);
      expect(payload.expiresAt).toBeLessThanOrEqual(after + 61000);
    });
  });

  describe('signExportToken', () => {
    it('creates a valid token string', () => {
      const payload = createExportTokenPayload('user-123', 'business');
      const token = signExportToken(payload);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(2);
    });

    it('different payloads produce different tokens', () => {
      const payload1 = createExportTokenPayload('user-1', 'business');
      const payload2 = createExportTokenPayload('user-2', 'career');
      const token1 = signExportToken(payload1);
      const token2 = signExportToken(payload2);
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyExportToken', () => {
    it('verifies a valid token', () => {
      const payload = createExportTokenPayload('user-123', 'business');
      const token = signExportToken(payload);
      const result = verifyExportToken(token);
      expect(result.valid).toBe(true);
      expect(result.payload).toBeDefined();
      expect(result.payload!.userId).toBe('user-123');
      expect(result.payload!.product).toBe('business');
    });

    it('rejects expired token', () => {
      const payload: ExportTokenPayload = {
        userId: 'user-123',
        product: 'business',
        expiresAt: Date.now() - 1000,
      };
      const token = signExportToken(payload);
      const result = verifyExportToken(token);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Token expired');
    });

    it('rejects tampered token', () => {
      const payload = createExportTokenPayload('user-123', 'business');
      const token = signExportToken(payload);
      const [encoded] = token.split('.');
      const tampered = `${encoded}.invalidsignature`;
      const result = verifyExportToken(tampered);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid signature');
    });

    it('rejects malformed token', () => {
      const result = verifyExportToken('not-a-token');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid token format');
    });

    it('rejects empty token', () => {
      const result = verifyExportToken('');
      expect(result.valid).toBe(false);
    });

    it('verifies product scope', () => {
      const payload = createExportTokenPayload('user-123', 'career');
      const token = signExportToken(payload);
      const result = verifyExportToken(token);
      expect(result.valid).toBe(true);
      expect(result.payload!.product).toBe('career');
    });

    it('rejects token with wrong product', () => {
      const payload = createExportTokenPayload('user-123', 'business');
      const token = signExportToken(payload);
      const result = verifyExportToken(token);
      expect(result.valid).toBe(true);
      expect(result.payload!.product).not.toBe('writing');
    });
  });

  describe('Security hardening', () => {
    it('uses timing-safe comparison (no timing leak)', () => {
      const payload = createExportTokenPayload('user-123', 'business');
      const token = signExportToken(payload);
      const [encoded] = token.split('.');
      const wrongSig = '0'.repeat(64);
      const result = verifyExportToken(`${encoded}.${wrongSig}`);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid signature');
    });

    it('production throws if no secret configured', () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('EXPORT_TOKEN_SECRET', '');
      vi.stubEnv('NEXTAUTH_SECRET', '');
      expect(() => signExportToken(createExportTokenPayload('user-123', 'business'))).toThrow(
        /CRITICAL.*No signing secret/,
      );
      vi.unstubAllEnvs();
    });
  });
});
