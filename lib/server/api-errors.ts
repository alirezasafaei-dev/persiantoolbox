/**
 * Standardized API error classes for consistent JSON error responses.
 * Use these in API routes instead of ad-hoc NextResponse.json error objects.
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'درخواست نامعتبر است.', code = 'BAD_REQUEST') {
    super(message, 400, code);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'برای انجام این عملیات باید وارد شوید.', code = 'UNAUTHORIZED') {
    super(message, 401, code);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'شما اجازه انجام این عملیات را ندارید.', code = 'FORBIDDEN') {
    super(message, 403, code);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'منبع مورد نظر یافت نشد.', code = 'NOT_FOUND') {
    super(message, 404, code);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends ApiError {
  public retryAfter: number;

  constructor(
    message = 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً بعداً تلاش کنید.',
    retryAfter = 60,
    code = 'RATE_LIMIT_EXCEEDED',
  ) {
    super(message, 429, code);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class InternalError extends ApiError {
  constructor(message = 'خطای داخلی سرور رخ داده است.', code = 'INTERNAL_ERROR') {
    super(message, 500, code);
    this.name = 'InternalError';
  }
}
