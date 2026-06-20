/**
 * Application-wide constants
 * Centralized configuration for maintainability
 */

export const APP_CONFIG = {
  // Rate limiting
  RATE_LIMIT: {
    LOGIN_ATTEMPTS: 5,
    LOGIN_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    REGISTER_ATTEMPTS: 3,
    REGISTER_WINDOW_MS: 60 * 60 * 1000, // 1 hour
    API_REQUESTS: 100,
    API_WINDOW_MS: 60 * 1000, // 1 minute
  },

  // File upload limits
  UPLOAD: {
    MAX_FILE_SIZE_MB: 50,
    MAX_IMAGE_SIZE_MB: 10,
    MAX_PDF_SIZE_MB: 100,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    ALLOWED_PDF_TYPES: ['application/pdf'],
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },

  // Cache durations (in seconds)
  CACHE: {
    SHORT: 60, // 1 minute
    MEDIUM: 300, // 5 minutes
    LONG: 3600, // 1 hour
    DAY: 86400, // 1 day
    WEEK: 604800, // 1 week
  },

  // Feature flags are managed via lib/features/availability.ts
  // Do not add legacy feature constants here

  // UI limits
  UI: {
    MAX_TEXT_LENGTH: 5000,
    MAX_TITLE_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 500,
    MAX_ITEMS_PER_LIST: 100,
  },

  // Timeouts (in milliseconds)
  TIMEOUTS: {
    API_REQUEST: 30000, // 30 seconds
    FILE_UPLOAD: 120000, // 2 minutes
    PDF_PROCESSING: 180000, // 3 minutes
  },
} as const;

export const ERROR_MESSAGES = {
  // Authentication
  AUTH_REQUIRED: 'لطفاً وارد شوید',
  INVALID_CREDENTIALS: 'ایمیل یا رمز عبور اشتباه است',
  SESSION_EXPIRED: 'جلسه شما منقضی شده است. لطفاً دوباره وارد شوید',

  // Validation
  INVALID_EMAIL: 'ایمیل نامعتبر است',
  INVALID_PASSWORD: 'رمز عبور باید حداقل ۸ کاراکتر باشد',
  PASSWORDS_MISMATCH: 'رمز عبور و تکرار آن مطابقت ندارند',

  // File operations
  FILE_TOO_LARGE: 'فایل خیلی بزرگ است',
  INVALID_FILE_TYPE: 'نوع فایل نامعتبر است',
  UPLOAD_FAILED: 'آپلود فایل با شکست مواجه شد',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'تعداد درخواست‌ها بیش از حد مجاز است',

  // General
  SOMETHING_WENT_WRONG: 'متأسفانه مشکلی پیش آمده',
  NETWORK_ERROR: 'خطای شبکه. لطفاً اتصال خود را بررسی کنید',
  SERVER_ERROR: 'خطای سرور. لطفاً بعداً دوباره تلاش کنید',
} as const;

export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'با موفقیت وارد شدید',
  REGISTER_SUCCESS: 'ثبت‌نام با موفقیت انجام شد',
  LOGOUT_SUCCESS: 'با موفقیت خارج شدید',

  // File operations
  UPLOAD_SUCCESS: 'فایل با موفقیت آپلود شد',
  DELETE_SUCCESS: 'فایل با موفقیت حذف شد',

  // Settings
  SETTINGS_SAVED: 'تنظیمات با موفقیت ذخیره شد',

  // General
  OPERATION_SUCCESS: 'عملیات با موفقیت انجام شد',
} as const;

export const ROUTES = {
  HOME: '/',
  TOOLS: '/tools',
  PDF_TOOLS: '/pdf-tools',
  IMAGE_TOOLS: '/image-tools',
  TEXT_TOOLS: '/text-tools',
  DATE_TOOLS: '/date-tools',
  VALIDATION_TOOLS: '/validation-tools',
  LOAN: '/loan',
  SALARY: '/salary',
  INTEREST: '/interest',
  ABOUT: '/about',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  ACCOUNT: '/account',
  ADMIN: '/admin',
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
} as const;
