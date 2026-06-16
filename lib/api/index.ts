/**
 * API Gateway - PersianToolbox
 *
 * Main entry point for API operations
 */

export {generateApiKey, validateApiKey, checkRateLimit, revokeApiKey, getUserApiKeys, getApiKeyById} from './api-key-manager';
export {checkRateLimit as checkEndpointRateLimit, resetRateLimit, getRateLimitStatus, cleanupExpiredLimits} from './rate-limiter';
export {registerRoute, findRoute, extractParams, handleRequest, getRoutes} from './api-router';

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
