/**
 * API Router - PersianToolbox
 *
 * Routes API requests to appropriate handlers
 */

import {agentLogger} from '@/lib/agent-logger';

type RouteHandler = (params: {
  query?: Record<string, string>;
  body?: unknown;
  userId?: string;
}) => Promise<unknown>;

interface Route {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  handler: RouteHandler;
  requireAuth: boolean;
  rateLimit?: number;
}

const routes: Route[] = [];

export function registerRoute(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  handler: RouteHandler,
  options: {requireAuth?: boolean; rateLimit?: number} = {},
): void {
  routes.push({
    method,
    path,
    handler,
    requireAuth: options.requireAuth ?? false,
    rateLimit: options.rateLimit,
  });
}

export function findRoute(
  method: string,
  path: string,
): Route | undefined {
  return routes.find(
    (r) => r.method === method && matchPath(r.path, path),
  );
}

function matchPath(pattern: string, path: string): boolean {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');

  if (patternParts.length !== pathParts.length) {
    return false;
  }

  return patternParts.every((part, i) => {
    if (part.startsWith(':')) {
      return true;
    }
    return part === pathParts[i];
  });
}

export function extractParams(pattern: string, path: string): Record<string, string> {
  const params: Record<string, string> = {};
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');

  patternParts.forEach((part, i) => {
    if (part.startsWith(':')) {
      params[part.slice(1)] = pathParts[i];
    }
  });

  return params;
}

export async function handleRequest(
  method: string,
  path: string,
  options: {
    query?: Record<string, string>;
    body?: unknown;
    userId?: string;
  } = {},
): Promise<{status: number; data: unknown}> {
  const route = findRoute(method, path);

  if (!route) {
    return {status: 404, data: {error: 'Route not found'}};
  }

  try {
    const result = await route.handler({
      query: options.query,
      body: options.body,
      userId: options.userId,
    });

    agentLogger.info('api-router', 'success', `${method} ${path}`);
    return {status: 200, data: result};
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    agentLogger.error('api-router', 'error', `${method} ${path}: ${message}`);
    return {status: 500, data: {error: message}};
  }
}

export function getRoutes(): Array<{method: string; path: string; requireAuth: boolean}> {
  return routes.map((r) => ({
    method: r.method,
    path: r.path,
    requireAuth: r.requireAuth,
  }));
}
