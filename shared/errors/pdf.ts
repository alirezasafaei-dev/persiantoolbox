/**
 * PDF-specific error types
 * Extends base error types for PDF operations
 */

import { BaseError } from './base';

// PDF-specific error codes
export const PDF_ERROR_CODES = {
  INVALID_PASSWORD: 'PDF_INVALID_PASSWORD',
  CORRUPTED_FILE: 'PDF_CORRUPTED_FILE',
  ENCRYPTION_FAILED: 'PDF_ENCRYPTION_FAILED',
  DECRYPTION_FAILED: 'PDF_DECRYPTION_FAILED',
  MERGE_FAILED: 'PDF_MERGE_FAILED',
  SPLIT_FAILED: 'PDF_SPLIT_FAILED',
  COMPRESS_FAILED: 'PDF_COMPRESS_FAILED',
  WATERMARK_FAILED: 'PDF_WATERMARK_FAILED',
  CONVERSION_FAILED: 'PDF_CONVERSION_FAILED',
  INVALID_PAGE_RANGE: 'PDF_INVALID_PAGE_RANGE',
  FILE_TOO_LARGE: 'PDF_FILE_TOO_LARGE',
  UNSUPPORTED_FORMAT: 'PDF_UNSUPPORTED_FORMAT',
} as const;

// PDF validation error
export class PdfValidationError extends BaseError {
  readonly code = PDF_ERROR_CODES.INVALID_PAGE_RANGE;
  readonly category = 'validation' as const;

  constructor(message: string) {
    super(message);
  }
}

// PDF processing error
export class PdfProcessingError extends BaseError {
  readonly code: keyof typeof PDF_ERROR_CODES;
  readonly category = 'processing' as const;

  constructor(operation: string, code: keyof typeof PDF_ERROR_CODES, cause?: Error) {
    super(`خطا در ${operation}: ${cause?.message ?? 'خطای نامشخص'}`, cause);
    this.code = code;
  }
}

// PDF-specific error factory
export const createPdfError = (operation: string, cause?: Error): PdfProcessingError => {
  // Determine error code based on operation and cause
  let code: keyof typeof PDF_ERROR_CODES = 'CONVERSION_FAILED';

  if (cause?.message.includes('password')) {
    code = 'INVALID_PASSWORD';
  } else if (cause?.message.includes('corrupt')) {
    code = 'CORRUPTED_FILE';
  } else if (operation.includes('encrypt')) {
    code = 'ENCRYPTION_FAILED';
  } else if (operation.includes('decrypt')) {
    code = 'DECRYPTION_FAILED';
  } else if (operation.includes('merge')) {
    code = 'MERGE_FAILED';
  } else if (operation.includes('split')) {
    code = 'SPLIT_FAILED';
  } else if (operation.includes('compress')) {
    code = 'COMPRESS_FAILED';
  } else if (operation.includes('watermark')) {
    code = 'WATERMARK_FAILED';
  }

  return new PdfProcessingError(operation, code, cause);
};

// Type guard for PDF errors
export function isPdfError(error: unknown): error is PdfProcessingError | PdfValidationError {
  return error instanceof PdfProcessingError || error instanceof PdfValidationError;
}
