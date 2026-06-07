import type { AdCampaign, AdSlot } from '@/shared/monetization/monetizationStore';

const MAX_TEXT_LENGTH = 160;
const MAX_SIZE_LENGTH = 32;
const MAX_URL_LENGTH = 2048;
const VALID_PLACEMENTS = new Set(['header', 'sidebar', 'inline', 'footer']);
const VALID_STATUSES = new Set<AdCampaign['status']>(['active', 'paused']);

export type SlotDraft = {
  name: string;
  placement: string;
  size: string;
};

export type CampaignDraft = {
  name: string;
  targetUrl: string;
  assetUrl: string;
  slotId: string | null;
  status: AdCampaign['status'];
};

export type SlotFormErrors = Partial<Record<keyof SlotDraft, string>>;
export type CampaignFormErrors = Partial<Record<keyof CampaignDraft, string>>;

function normalizeComparable(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('fa-IR');
}

function isSafeInternalPath(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\');
}

export function isAllowedCampaignUrl(value: string, required: boolean): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return !required;
  }
  if (trimmed.length > MAX_URL_LENGTH) {
    return false;
  }
  if (isSafeInternalPath(trimmed)) {
    return true;
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function validateSlotDraft(draft: SlotDraft, existingSlots: AdSlot[]): SlotFormErrors {
  const errors: SlotFormErrors = {};
  const name = draft.name.trim();
  const size = draft.size.trim();

  if (!name) {
    errors.name = 'نام اسلات الزامی است.';
  } else if (name.length > MAX_TEXT_LENGTH) {
    errors.name = `نام اسلات نباید بیشتر از ${MAX_TEXT_LENGTH} نویسه باشد.`;
  } else {
    const normalizedName = normalizeComparable(name);
    const duplicate = existingSlots.some(
      (slot) => normalizeComparable(slot.name) === normalizedName,
    );
    if (duplicate) {
      errors.name = 'اسلاتی با این نام قبلاً ثبت شده است.';
    }
  }

  if (!VALID_PLACEMENTS.has(draft.placement)) {
    errors.placement = 'جایگاه انتخاب‌شده معتبر نیست.';
  }

  if (size.length > MAX_SIZE_LENGTH) {
    errors.size = `ابعاد نباید بیشتر از ${MAX_SIZE_LENGTH} نویسه باشد.`;
  }

  return errors;
}

export function validateCampaignDraft(
  draft: CampaignDraft,
  existingSlots: AdSlot[],
  existingCampaigns: AdCampaign[],
): CampaignFormErrors {
  const errors: CampaignFormErrors = {};
  const name = draft.name.trim();

  if (!name) {
    errors.name = 'نام کمپین الزامی است.';
  } else if (name.length > MAX_TEXT_LENGTH) {
    errors.name = `نام کمپین نباید بیشتر از ${MAX_TEXT_LENGTH} نویسه باشد.`;
  } else {
    const normalizedName = normalizeComparable(name);
    const duplicate = existingCampaigns.some(
      (campaign) => normalizeComparable(campaign.name) === normalizedName,
    );
    if (duplicate) {
      errors.name = 'کمپینی با این نام قبلاً ثبت شده است.';
    }
  }

  if (!draft.targetUrl.trim()) {
    errors.targetUrl = 'لینک مقصد الزامی است.';
  } else if (!isAllowedCampaignUrl(draft.targetUrl, true)) {
    errors.targetUrl = 'لینک مقصد باید مسیر داخلی یا URL معتبر http/https باشد.';
  }

  if (draft.assetUrl.trim() && !isAllowedCampaignUrl(draft.assetUrl, false)) {
    errors.assetUrl = 'لینک دارایی باید مسیر داخلی یا URL معتبر http/https باشد.';
  }

  if (draft.slotId && !existingSlots.some((slot) => slot.id === draft.slotId)) {
    errors.slotId = 'اسلات انتخاب‌شده دیگر در دسترس نیست.';
  }

  if (!VALID_STATUSES.has(draft.status)) {
    errors.status = 'وضعیت انتخاب‌شده معتبر نیست.';
  }

  return errors;
}

export function hasFormErrors(errors: SlotFormErrors | CampaignFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
