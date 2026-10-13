import type { Pool } from 'pg';
export class ImageError extends Error {
  code: string;
  constructor(code: string);
}
export type ImageJob = {
  id: string;
  status: string;
  stage: string;
  code: string | null;
  createdAt: number;
  expiresAt: number;
};
export function keyFromEnv(value: string | undefined): Buffer;
export function digest(value: string, key: Buffer): string;
export function newSession(key: Buffer, now?: number): string;
export function ownerFromCookie(
  value: string | undefined,
  key: Buffer,
  now?: number,
): string | null;
export function encrypt(bytes: Buffer, key: Buffer, aad: string): Buffer;
export function decrypt(bytes: Buffer, key: Buffer, aad: string): Buffer;
export function validatePrompt(value: unknown): string;
export function identifyImage(bytes: Buffer): string;
export function validId(value: unknown): boolean;
export const safeCodes: Set<string>;
export function createStore(
  pool: Pool,
  key: Buffer,
): {
  submit(owner: string, ip: string, prompt: unknown, requestId: unknown): Promise<ImageJob>;
  get(owner: string, id: string): Promise<ImageJob | null>;
  latest(owner: string): Promise<ImageJob | null>;
  cancel(owner: string, id: string): Promise<ImageJob | null>;
  image(owner: string, id: string): Promise<{ bytes: Buffer; mime: string } | null>;
};
