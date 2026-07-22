/**
 * Centralized API error handler.
 * Wrap API route handlers with handleApiError to get consistent JSON responses
 * for both ApiError instances and unexpected errors.
 */

import { NextResponse } from 'next/server';
import { ApiError, RateLimitError } from '@/lib/server/api-errors';
import { logger } from '@/lib/server/logger';

type ApiResponse = {
  ok: false;
  error: string;
  code: string;
  retryAfter?: number;
};

export function handleApiError(error: unknown, route?: string): NextResponse<ApiResponse> {
  if (error instanceof RateLimitError) {
    if (route) {
      logger.warn('Rate limit exceeded', { route });
    }
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        code: error.code ?? 'RATE_LIMIT_EXCEEDED',
        retryAfter: error.retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': error.retryAfter.toString(),
        },
      },
    );
  }

  if (error instanceof ApiError) {
    if (route && error.statusCode >= 500) {
      logger.error(`API error in ${route}`, {
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
      });
    }
    return NextResponse.json(
      { ok: false, error: error.message, code: error.code ?? 'UNKNOWN_ERROR' },
      { status: error.statusCode },
    );
  }

  if (route) {
    logger.error(`Unhandled error in ${route}`, {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return NextResponse.json(
    { ok: false, error: 'خطای داخلی سرور رخ داده است.', code: 'INTERNAL_ERROR' },
    { status: 500 },
  );
}
