import { createHmac, timingSafeEqual } from 'node:crypto';

const TOKEN_EXPIRY_SECONDS = 60;

function getSigningSecret(): string {
  const secret = process.env['EXPORT_TOKEN_SECRET'] ?? process.env['NEXTAUTH_SECRET'];
  if (!secret) {
    if (process.env['NODE_ENV'] === 'production') {
      throw new Error(
        '[export-token] CRITICAL: No signing secret configured. Set EXPORT_TOKEN_SECRET or NEXTAUTH_SECRET.',
      );
    }
    return 'dev-only-secret-not-for-production';
  }
  return secret;
}

export type ExportTokenPayload = {
  userId: string;
  product: 'business' | 'career' | 'writing';
  expiresAt: number;
};

export function signExportToken(payload: ExportTokenPayload): string {
  const secret = getSigningSecret();
  const data = JSON.stringify(payload);
  const signature = createHmac('sha256', secret).update(data).digest('hex');
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

    const secret = getSigningSecret();
    const data = Buffer.from(encoded, 'base64url').toString();
    const expectedSignature = createHmac('sha256', secret).update(data).digest('hex');

    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
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
