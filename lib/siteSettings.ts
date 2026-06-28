export type PublicSiteSettings = {
  developerName: string;
  developerBrandText: string;
  orderUrl: string | null;
  portfolioUrl: string | null;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  companyName: string;
  telegramUrl: string;
  instagramUrl: string;
  whatsappUrl: string;
  supportPageUrl: string;
};

export type SiteSettingsPatch = Partial<{
  developerName: string;
  developerBrandText: string;
  orderUrl: string | null;
  portfolioUrl: string | null;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  companyName: string;
  telegramUrl: string;
  instagramUrl: string;
  whatsappUrl: string;
  supportPageUrl: string;
}>;

export const SITE_SETTINGS_KEYS = {
  developerName: 'developer_name',
  developerBrandText: 'developer_brand_text',
  orderUrl: 'order_url',
  portfolioUrl: 'portfolio_url',
  contactEmail: 'contact_email',
  contactPhone: 'contact_phone',
  contactAddress: 'contact_address',
  companyName: 'company_name',
  telegramUrl: 'telegram_url',
  instagramUrl: 'instagram_url',
  whatsappUrl: 'whatsapp_url',
  supportPageUrl: 'support_page_url',
} as const;

export const SITE_SETTINGS_ENV_KEYS = {
  developerName: 'DEVELOPER_NAME',
  developerBrandText: 'DEVELOPER_BRAND_TEXT',
  orderUrl: 'ORDER_URL',
  portfolioUrl: 'PORTFOLIO_URL',
  contactEmail: 'CONTACT_EMAIL',
  contactPhone: 'CONTACT_PHONE',
  contactAddress: 'CONTACT_ADDRESS',
  companyName: 'COMPANY_NAME',
  telegramUrl: 'TELEGRAM_URL',
  instagramUrl: 'INSTAGRAM_URL',
  whatsappUrl: 'WHATSAPP_URL',
  supportPageUrl: 'SUPPORT_PAGE_URL',
} as const;

export const DEFAULT_SITE_SETTINGS: PublicSiteSettings = {
  developerName: 'علیرضا صفایی',
  developerBrandText: 'توسعه و نگهداری این سرویس توسط ASDEV انجام می‌شود.',
  orderUrl: null,
  portfolioUrl: 'https://alirezasafaeisystems.ir/',
  contactEmail: 'alirezasafaeisystems@gmail.com',
  contactPhone: '۰۲۱-۹۱۰۳۵۳۹۸',
  contactAddress: 'کرمانشاه، خیابان ۲۲ بهمن',
  companyName: 'ASDEV',
  telegramUrl: 'https://t.me/persiantoolbox',
  instagramUrl: '',
  whatsappUrl: '',
  supportPageUrl: '/support',
};

export function normalizeText(
  value: string | null | undefined,
  fallback: string,
  maxLength = 140,
): string {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) {
    return fallback;
  }
  return trimmed.slice(0, maxLength);
}

export function normalizeOptionalUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

export function mergeSiteSettings(
  values: Partial<PublicSiteSettings>,
  fallback: PublicSiteSettings = DEFAULT_SITE_SETTINGS,
): PublicSiteSettings {
  return {
    developerName: normalizeText(values.developerName, fallback.developerName, 80),
    developerBrandText: normalizeText(values.developerBrandText, fallback.developerBrandText, 240),
    orderUrl: normalizeOptionalUrl(values.orderUrl) ?? fallback.orderUrl,
    portfolioUrl: normalizeOptionalUrl(values.portfolioUrl) ?? fallback.portfolioUrl,
    contactEmail: normalizeText(values.contactEmail, fallback.contactEmail, 200),
    contactPhone: normalizeText(values.contactPhone, fallback.contactPhone, 40),
    contactAddress: normalizeText(values.contactAddress, fallback.contactAddress, 300),
    companyName: normalizeText(values.companyName, fallback.companyName, 100),
    telegramUrl: normalizeText(values.telegramUrl, fallback.telegramUrl, 200),
    instagramUrl: normalizeText(values.instagramUrl, fallback.instagramUrl, 200),
    whatsappUrl: normalizeText(values.whatsappUrl, fallback.whatsappUrl, 200),
    supportPageUrl: normalizeText(values.supportPageUrl, fallback.supportPageUrl, 200),
  };
}

export function validateSiteSettingsPatch(
  input: unknown,
): { ok: true; value: SiteSettingsPatch } | { ok: false; errors: string[] } {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return { ok: false, errors: ['بدنه درخواست نامعتبر است.'] };
  }

  const body = input as Record<string, unknown>;
  const errors: string[] = [];
  const patch: SiteSettingsPatch = {};

  const validateStringField = (
    field:
      | 'developerName'
      | 'developerBrandText'
      | 'contactEmail'
      | 'contactPhone'
      | 'contactAddress'
      | 'companyName'
      | 'telegramUrl'
      | 'instagramUrl'
      | 'whatsappUrl'
      | 'supportPageUrl',
    maxLength: number,
  ) => {
    if (!(field in body)) {
      return;
    }
    const value = body[field];
    if (typeof value !== 'string') {
      errors.push(`فیلد ${field} باید رشته باشد.`);
      return;
    }
    patch[field] = value.trim().slice(0, maxLength);
  };

  const validateUrlField = (field: 'orderUrl' | 'portfolioUrl') => {
    if (!(field in body)) {
      return;
    }
    const value = body[field];
    if (value !== null && typeof value !== 'string') {
      errors.push(`فیلد ${field} باید رشته یا null باشد.`);
      return;
    }
    const normalized = normalizeOptionalUrl(value);
    if (value && typeof value === 'string' && value.trim().length > 0 && !normalized) {
      errors.push(`فیلد ${field} باید URL معتبر با http/https یا مسیر داخلی باشد.`);
      return;
    }
    patch[field] = normalized;
  };

  validateStringField('developerName', 80);
  validateStringField('developerBrandText', 240);
  validateStringField('contactEmail', 200);
  validateStringField('contactPhone', 40);
  validateStringField('contactAddress', 300);
  validateStringField('companyName', 100);
  validateStringField('telegramUrl', 200);
  validateStringField('instagramUrl', 200);
  validateStringField('whatsappUrl', 200);
  validateStringField('supportPageUrl', 200);
  validateUrlField('orderUrl');
  validateUrlField('portfolioUrl');

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, value: patch };
}
