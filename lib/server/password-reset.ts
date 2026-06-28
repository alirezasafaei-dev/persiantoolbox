import { randomBytes } from 'node:crypto';
import { query } from './db';
import { hashPassword } from './passwords';
import { logger } from './logger';

const TOKEN_LENGTH = 32;
const TOKEN_EXPIRY_HOURS = 1;

export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = randomBytes(TOKEN_LENGTH).toString('hex');
  const expiresAt = Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000;

  // Delete any existing reset tokens for this user
  await query('DELETE FROM password_resets WHERE user_id = $1', [userId]);

  await query('INSERT INTO password_resets (token, user_id, expires_at) VALUES ($1, $2, $3)', [
    token,
    userId,
    expiresAt,
  ]);

  return token;
}

export async function verifyPasswordResetToken(
  token: string,
): Promise<{ valid: boolean; userId?: string; error?: string }> {
  if (!token || token.length !== TOKEN_LENGTH * 2) {
    return { valid: false, error: 'توکن نامعتبر است.' };
  }

  const result = await query<{ user_id: string; expires_at: number }>(
    'SELECT user_id, expires_at FROM password_resets WHERE token = $1 LIMIT 1',
    [token],
  );

  if (result.rowCount === 0) {
    return { valid: false, error: 'توکن یافت نشد.' };
  }

  const row = result.rows[0];
  if (!row) {
    return { valid: false, error: 'توکن یافت نشد.' };
  }

  if (row.expires_at < Date.now()) {
    await query('DELETE FROM password_resets WHERE token = $1', [token]);
    return { valid: false, error: 'توکن منقضی شده است.' };
  }

  return { valid: true, userId: row.user_id };
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<{ success: boolean; error: string }> {
  const verification = await verifyPasswordResetToken(token);
  if (!verification.valid || !verification.userId) {
    return { success: false, error: verification.error ?? 'خطا در بازیابی رمز عبور.' };
  }

  const passwordHash = await hashPassword(newPassword);

  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [
    passwordHash,
    verification.userId,
  ]);

  // Delete the used token
  await query('DELETE FROM password_resets WHERE token = $1', [token]);

  // Delete all sessions for this user (force re-login)
  await query('DELETE FROM sessions WHERE user_id = $1', [verification.userId]);

  logger.info('Password reset successful', { userId: verification.userId });

  return { success: true, error: '' };
}
