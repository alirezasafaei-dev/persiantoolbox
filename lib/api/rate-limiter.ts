/**
 * Rate Limiter - PersianToolbox
 *
 * Implements rate limiting for API endpoints
 */

import {agentLogger} from '@/lib/agent-logger';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimits = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 60,
  message: 'Too many requests, please try again later',
};

export function checkRateLimit(
  identifier: string,
  config: Partial<RateLimitConfig> = {},
): {allowed: boolean; remaining: number; resetAt: number} {
  const mergedConfig = {...defaultConfig, ...config};
  const now = Date.now();
  const entry = rateLimits.get(identifier);

  if (!entry || now > entry.resetAt) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + mergedConfig.windowMs,
    };
    rateLimits.set(identifier, newEntry);
    return {
      allowed: true,
      remaining: mergedConfig.maxRequests - 1,
      resetAt: newEntry.resetAt,
    };
  }

  if (entry.count >= mergedConfig.maxRequests) {
    agentLogger.warn('rate-limit', 'exceeded', `Rate limit exceeded for: ${identifier}`);
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: mergedConfig.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

export function resetRateLimit(identifier: string): void {
  rateLimits.delete(identifier);
}

export function getRateLimitStatus(identifier: string): {
  count: number;
  remaining: number;
  resetAt: number;
} | null {
  const entry = rateLimits.get(identifier);
  if (!entry) {
    return null;
  }

  return {
    count: entry.count,
    remaining: Math.max(0, defaultConfig.maxRequests - entry.count),
    resetAt: entry.resetAt,
  };
}

export function cleanupExpiredLimits(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimits) {
    if (now > entry.resetAt) {
      rateLimits.delete(key);
    }
  }
}

setInterval(cleanupExpiredLimits, 60 * 1000);
