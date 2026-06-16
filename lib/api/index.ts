/**
 * API Gateway - PersianToolbox
 *
 * Main entry point for API operations
 */

export {apiKeyManager} from './api-key-manager';
export {rateLimiter} from './rate-limiter';
export {apiRouter} from './api-router';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  headers: Record<string, string>;
  query?: Record<string, string>;
  body?: unknown;
  apiKey?: string;
}

export function createApiResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

export function createApiError(code: string, message: string): ApiResponse {
  return {
    success: false,
    error: {code, message},
  };
}
