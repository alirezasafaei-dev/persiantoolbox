/**
 * Base error types for the application
 * Follows docs/project-standards.md error handling requirements
 */

// Base error class with error codes
export abstract class BaseError extends Error {
  abstract readonly code: string;
  abstract readonly category: 'validation' | 'processing' | 'network' | 'filesystem' | 'permission';

  constructor(
    message: string,
    public override readonly cause?: Error,
  ) {
    super(message);
    this.name = this.constructor.name;

    // Maintains proper stack trace for where our error was thrown
    const captureStackTrace = (
      Error as ErrorConstructor & {
        captureStackTrace?: (target: Error, constructorOpt?: Function) => void;
      }
    ).captureStackTrace;
    if (typeof captureStackTrace === 'function') {
      captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      category: this.category,
      message: this.message,
      cause: this.cause?.message,
    };
  }
}

// Validation errors
export class ValidationError extends BaseError {
  readonly code = 'VALIDATION_ERROR';
  readonly category = 'validation' as const;

  constructor(message: string, field?: string) {
    super(field ? `${field}: ${message}` : message);
  }
}

// Processing errors
export class ProcessingError extends BaseError {
  readonly code = 'PROCESSING_ERROR';
  readonly category = 'processing' as const;

  constructor(operation: string, cause?: Error) {
    super(`خطا در ${operation}: ${cause?.message ?? 'خطای نامشخص'}`, cause);
  }
}

// File system errors
export class FileError extends BaseError {
  readonly code = 'FILE_ERROR';
  readonly category = 'filesystem' as const;

  constructor(operation: string, filename?: string, cause?: Error) {
    super(
      `خطا در ${operation}${filename ? ` فایل ${filename}` : ''}: ${cause?.message ?? 'خطای نامشخص'}`,
      cause,
    );
  }
}

// Permission errors
export class PermissionError extends BaseError {
  readonly code = 'PERMISSION_ERROR';
  readonly category = 'permission' as const;

  constructor(operation: string) {
    super(`شما مجوز لازم برای ${operation} را ندارید`);
  }
}

// Error factory functions
export const createError = {
  validation: (message: string, field?: string) => new ValidationError(message, field),
  processing: (operation: string, cause?: Error) => new ProcessingError(operation, cause),
  file: (operation: string, filename?: string, cause?: Error) =>
    new FileError(operation, filename, cause),
  permission: (operation: string) => new PermissionError(operation),
};

// Type guard for checking error types
export function isBaseError(error: unknown): error is BaseError {
  return error instanceof BaseError;
}

// Helper to get user-friendly message
export function getUserMessage(error: unknown): string {
  if (isBaseError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'خطای نامشخص رخ داد';
}
