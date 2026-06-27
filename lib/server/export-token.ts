import { createHmac } from 'node:crypto';

const TOKEN_EXPIRY_SECONDS = 60;
const SIGNING_SECRET =
  process.env['EXPORT_TOKEN_SECRET'] ??
  process.env['NEXTAUTH_SECRET'] ??
  'fallback-dev-secret-change-in-production';

export type ExportTokenPayload = {
  userId: string;
  product: 'business' | 'career' | 'writing';
  expiresAt: number;
};

export function signExportToken(payload: ExportTokenPayload): string {
  const data = JSON.stringify(payload);
  const signature = createHmac('sha256', SIGNING_SECRET).update(data).digest('hex');
  const encoded = Buffer.from(data).toString('base64url');
  return `${encoded}.${signature}`;
}

export function verifyExportToken(token: string): {
  valid: boolean;
  payload?: ExportTokenPayload;
  error?: string;
} {
  try {
    const [encoded, signature] = token.split('.');
    if (!encoded || !signature) {
      return { valid: false, error: 'Invalid token format' };
    }

    const data = Buffer.from(encoded, 'base64url').toString();
    const expectedSignature = createHmac('sha256', SIGNING_SECRET).update(data).digest('hex');

    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid signature' };
    }

    const payload: ExportTokenPayload = JSON.parse(data);

    if (Date.now() > payload.expiresAt) {
      return { valid: false, error: 'Token expired' };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, error: 'Invalid token' };
  }
}

export function createExportTokenPayload(
  userId: string,
  product: ExportTokenPayload['product'],
): ExportTokenPayload {
  return {
    userId,
    product,
    expiresAt: Date.now() + TOKEN_EXPIRY_SECONDS * 1000,
  };
}
