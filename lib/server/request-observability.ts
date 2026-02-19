export function getRequestId(request: Request): string {
  return request.headers.get('x-request-id') ?? 'unknown';
}

export function logApiEvent(
  request: Request,
  payload: {
    route: string;
    event: 'request' | 'response' | 'error';
    status?: number;
    details?: Record<string, unknown>;
  },
): void {
  const record = {
    ts: new Date().toISOString(),
    requestId: getRequestId(request),
    method: request.method,
    route: payload.route,
    event: payload.event,
    status: payload.status,
    details: payload.details,
  };

  // eslint-disable-next-line no-console
  console.info(JSON.stringify(record));
}
