export type ToolError = {
  code: string;
  message: string;
  details?: unknown;
};

export type ToolResult<T> = { ok: true; data: T } | { ok: false; error: ToolError };

export const ok = <T>(data: T): ToolResult<T> => ({ ok: true, data });

export const fail = (message: string, code = 'ERROR', details?: unknown): ToolResult<never> => ({
  ok: false,
  error: {
    code,
    message,
    ...(details !== undefined ? { details } : {}),
  },
});

export const fromError = (
  error: unknown,
  fallbackMessage = 'خطای نامشخص رخ داد.',
  code = 'ERROR',
): ToolResult<never> => {
  if (error instanceof Error) {
    return fail(error.message, code);
  }
  return fail(fallbackMessage, code, error);
};
