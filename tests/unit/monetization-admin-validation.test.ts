import { describe, expect, it } from 'vitest';
import {
  isAllowedCampaignUrl,
  validateCampaignDraft,
  validateSlotDraft,
} from '@/components/features/monetization/formValidation';
import type { AdCampaign, AdSlot } from '@/shared/monetization/monetizationStore';

const existingSlot: AdSlot = {
  id: 'slot-1',
  name: 'بنر هدر',
  placement: 'header',
  size: '728x90',
  active: true,
  createdAt: 1780833600000,
  updatedAt: null,
};

const existingCampaign: AdCampaign = {
  id: 'campaign-1',
  name: 'کمپین نوروز',
  sponsor: 'برند نمونه',
  targetUrl: '/pro',
  assetUrl: '/ads/banner.png',
  slotId: existingSlot.id,
  status: 'active',
  createdAt: 1780833600000,
  updatedAt: null,
};

describe('monetization admin form validation', () => {
  it('accepts only safe campaign URLs', () => {
    expect(isAllowedCampaignUrl('/pro', true)).toBe(true);
    expect(isAllowedCampaignUrl('https://example.test/path?x=1', true)).toBe(true);
    expect(isAllowedCampaignUrl('http://example.test/path', true)).toBe(true);
    expect(isAllowedCampaignUrl('', false)).toBe(true);

    expect(isAllowedCampaignUrl('', true)).toBe(false);
    expect(isAllowedCampaignUrl('ftp://example.test/file', true)).toBe(false);
    expect(isAllowedCampaignUrl('//example.test/protocol-relative', true)).toBe(false);
    expect(isAllowedCampaignUrl('/\\evil', true)).toBe(false);
  });

  it('blocks duplicate slot names and invalid slot metadata before storage writes', () => {
    const errors = validateSlotDraft(
      {
        name: ' بنر  هدر ',
        placement: 'unknown',
        size: 'x'.repeat(40),
      },
      [existingSlot],
    );

    expect(errors).toEqual({
      name: 'اسلاتی با این نام قبلاً ثبت شده است.',
      placement: 'جایگاه انتخاب‌شده معتبر نیست.',
      size: 'ابعاد نباید بیشتر از 32 نویسه باشد.',
    });
  });

  it('blocks duplicate campaigns, unsafe urls, stale slots, and invalid statuses', () => {
    const errors = validateCampaignDraft(
      {
        name: 'کمپین نوروز',
        targetUrl: 'data:text/plain,hello',
        assetUrl: 'ftp://cdn.example.test/banner.png',
        slotId: 'missing-slot',
        status: 'archived' as AdCampaign['status'],
      },
      [existingSlot],
      [existingCampaign],
    );

    expect(errors).toEqual({
      name: 'کمپینی با این نام قبلاً ثبت شده است.',
      targetUrl: 'لینک مقصد باید مسیر داخلی یا URL معتبر http/https باشد.',
      assetUrl: 'لینک دارایی باید مسیر داخلی یا URL معتبر http/https باشد.',
      slotId: 'اسلات انتخاب‌شده دیگر در دسترس نیست.',
      status: 'وضعیت انتخاب‌شده معتبر نیست.',
    });
  });
});
