export type PublicSiteSettings = {
  developerName: string;
  developerBrandText: string;
  orderUrl: string | null;
  portfolioUrl: string | null;
};

export type SiteSettingsPatch = Partial<{
  developerName: string;
  developerBrandText: string;
  orderUrl: string | null;
  portfolioUrl: string | null;
}>;

export const SITE_SETTINGS_KEYS = {
  developerName: 'developer_name',
  developerBrandText: 'developer_brand_text',
  orderUrl: 'order_url',
  portfolioUrl: 'portfolio_url',
} as const;

export const SITE_SETTINGS_ENV_KEYS = {
  developerName: 'DEVELOPER_NAME',
  developerBrandText: 'DEVELOPER_BRAND_TEXT',
  orderUrl: 'ORDER_URL',
  portfolioUrl: 'PORTFOLIO_URL',
} as const;

export const DEFAULT_SITE_SETTINGS: PublicSiteSettings = {
  developerName: 'تیم جعبه ابزار فارسی',
  developerBrandText: 'طراحی و نگهداری این سرویس توسط تیم جعبه ابزار فارسی انجام می‌شود.',
  orderUrl: null,
  portfolioUrl: null,
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
    field: 'developerName' | 'developerBrandText',
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
    const normalized = normalizeOptionalUrl(value as string | null);
    if (value && typeof value === 'string' && value.trim().length > 0 && !normalized) {
      errors.push(`فیلد ${field} باید URL معتبر با http/https یا مسیر داخلی باشد.`);
      return;
    }
    patch[field] = normalized;
  };

  validateStringField('developerName', 80);
  validateStringField('developerBrandText', 240);
  validateUrlField('orderUrl');
  validateUrlField('portfolioUrl');

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, value: patch };
}
