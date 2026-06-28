/**
 * Input validation utilities for API endpoints and user data
 * Provides type-safe validation with detailed error messages
 */

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

type ValidationResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      errors: ValidationError[];
    };

// Common validators
const validators = {
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  url: (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  persianText: (value: string): boolean => {
    // Allow Persian, Arabic, numbers, and common punctuation
    const persianRegex =
      /^[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF\s0-9.,!?;:'"()[\]{}\-_=+@#$%&*]*$/;
    return persianRegex.test(value);
  },

  phoneNumber: (value: string): boolean => {
    // Iranian phone number format
    const phoneRegex = /^0?[1-9]\d{9}$/;
    return phoneRegex.test(value.replace(/[\s-]/g, ''));
  },

  nationalId: (value: string): boolean => {
    // Iranian national ID (کد ملی) validation
    const cleaned = value.replace(/[\s-]/g, '');
    if (!/^\d{10}$/.test(cleaned)) {
      return false;
    }

    const check = parseInt(cleaned[9] ?? '0', 10);
    const sum =
      cleaned
        .slice(0, 9)
        .split('')
        .reduce((acc, digit, index) => acc + parseInt(digit, 10) * (10 - index), 0) % 11;

    return sum < 2 ? check === sum : check + sum === 11;
  },

  password: (value: string): boolean => {
    // Minimum 8 characters, at least one letter and one number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(value);
  },

  string: (value: unknown): value is string => {
    return typeof value === 'string';
  },

  number: (value: unknown): value is number => {
    return typeof value === 'number' && !isNaN(value);
  },

  boolean: (value: unknown): value is boolean => {
    return typeof value === 'boolean';
  },

  array: (value: unknown): value is unknown[] => {
    return Array.isArray(value);
  },

  object: (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  },
};

// Validation schema builder
class Schema<T> {
  private rules: Array<(value: unknown, path: string) => ValidationError[]> = [];

  static create<T>(): Schema<T> {
    return new Schema<T>();
  }

  private addRule(rule: (value: unknown, path: string) => ValidationError[]): this {
    this.rules.push(rule);
    return this;
  }

  required(message = 'This field is required'): this {
    return this.addRule((value, path) => {
      if (value === null || value === undefined || value === '') {
        return [new ValidationError(message, path, 'REQUIRED')];
      }
      return [];
    });
  }

  optional(): this {
    return this.addRule((value) => {
      if (value === null || value === undefined || value === '') {
        return [];
      }
      return [];
    });
  }

  email(message = 'Invalid email format'): this {
    return this.addRule((value, path) => {
      if (typeof value === 'string' && !validators.email(value)) {
        return [new ValidationError(message, path, 'INVALID_EMAIL')];
      }
      return [];
    });
  }

  url(message = 'Invalid URL format'): this {
    return this.addRule((value, path) => {
      if (typeof value === 'string' && !validators.url(value)) {
        return [new ValidationError(message, path, 'INVALID_URL')];
      }
      return [];
    });
  }

  minLength(min: number, message?: string): this {
    return this.addRule((value, path) => {
      if (typeof value === 'string' && value.length < min) {
        return [
          new ValidationError(message ?? `Must be at least ${min} characters`, path, 'MIN_LENGTH'),
        ];
      }
      if (Array.isArray(value) && value.length < min) {
        return [
          new ValidationError(message ?? `Must have at least ${min} items`, path, 'MIN_LENGTH'),
        ];
      }
      return [];
    });
  }

  maxLength(max: number, message?: string): this {
    return this.addRule((value, path) => {
      if (typeof value === 'string' && value.length > max) {
        return [
          new ValidationError(message ?? `Must be at most ${max} characters`, path, 'MAX_LENGTH'),
        ];
      }
      if (Array.isArray(value) && value.length > max) {
        return [
          new ValidationError(message ?? `Must have at most ${max} items`, path, 'MAX_LENGTH'),
        ];
      }
      return [];
    });
  }

  min(min: number, message?: string): this {
    return this.addRule((value, path) => {
      if (typeof value === 'number' && value < min) {
        return [new ValidationError(message ?? `Must be at least ${min}`, path, 'MIN_VALUE')];
      }
      return [];
    });
  }

  max(max: number, message?: string): this {
    return this.addRule((value, path) => {
      if (typeof value === 'number' && value > max) {
        return [new ValidationError(message ?? `Must be at most ${max}`, path, 'MAX_VALUE')];
      }
      return [];
    });
  }

  pattern(regex: RegExp, message = 'Invalid format'): this {
    return this.addRule((value, path) => {
      if (typeof value === 'string' && !regex.test(value)) {
        return [new ValidationError(message, path, 'PATTERN_MISMATCH')];
      }
      return [];
    });
  }

  oneOf<TValue>(allowed: TValue[], message?: string): this {
    return this.addRule((value, path) => {
      if (!allowed.includes(value as TValue)) {
        return [
          new ValidationError(
            message ?? `Must be one of: ${allowed.join(', ')}`,
            path,
            'INVALID_VALUE',
          ),
        ];
      }
      return [];
    });
  }

  custom(validator: (value: unknown) => boolean, message: string, code?: string): this {
    return this.addRule((value, path) => {
      if (!validator(value)) {
        return [new ValidationError(message, path, code)];
      }
      return [];
    });
  }

  validate(value: unknown): ValidationResult<T> {
    const errors: ValidationError[] = [];
    for (const rule of this.rules) {
      errors.push(...rule(value, ''));
    }
    if (errors.length > 0) {
      return { success: false, errors };
    }
    return { success: true, data: value as T };
  }
}

// Object validation
export function validateObject<T extends Record<string, unknown>>(
  schema: { [K in keyof T]: Schema<T[K]> },
  data: unknown,
): ValidationResult<T> {
  if (!validators.object(data)) {
    return {
      success: false,
      errors: [new ValidationError('Expected an object', '', 'INVALID_TYPE')],
    };
  }

  const errors: ValidationError[] = [];
  const result: Partial<T> = {};

  for (const [key, fieldSchema] of Object.entries(schema)) {
    const value = data[key];
    const fieldResult = fieldSchema.validate(value);

    if (!fieldResult.success) {
      errors.push(
        ...fieldResult.errors.map((error: ValidationError) => ({
          ...error,
          field: error.field ? `${key}.${error.field}` : key,
        })),
      );
    } else {
      (result as Record<string, unknown>)[key] = fieldResult.data;
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: result as T };
}

// Common validation schemas
export const commonSchemas = {
  email: Schema.create<string>().required().email(),
  password: Schema.create<string>()
    .required()
    .minLength(8, 'Password must be at least 8 characters')
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number'),
  optionalPassword: Schema.create<string>()
    .optional()
    .minLength(8, 'Password must be at least 8 characters'),
  name: Schema.create<string>()
    .required()
    .minLength(2, 'Name must be at least 2 characters')
    .maxLength(100, 'Name must not exceed 100 characters'),
  url: Schema.create<string>().url(),
  optionalUrl: Schema.create<string>().url().maxLength(2048),
};
