import { describe, expect, it } from 'vitest';
import {
  getAllOffers,
  getAllPlacements,
  getCtaForPlacement,
  getOfferById,
  getPlacementById,
} from '@/lib/cta-registry';

describe('CTA registry', () => {
  it('returns all placements', () => {
    const placements = getAllPlacements();
    expect(placements.length).toBeGreaterThanOrEqual(5);
    expect(placements.map((p) => p.id)).toContain('footer-global');
    expect(placements.map((p) => p.id)).toContain('tool-result-pdf');
  });

  it('returns all offers', () => {
    const offers = getAllOffers();
    expect(offers.length).toBeGreaterThanOrEqual(3);
    expect(offers.map((o) => o.id)).toContain('portfolio-brand');
    expect(offers.map((o) => o.id)).toContain('audit-free-check');
  });

  it('resolves CTA for footer-global placement', () => {
    const result = getCtaForPlacement('footer-global');
    expect(result).not.toBeNull();
    expect(result?.offer.id).toBe('portfolio-brand');
    expect(result?.href).toContain('utm_source=toolbox');
    expect(result?.href).toContain('utm_content=footer-global');
  });

  it('resolves CTA for tool-result-pdf placement', () => {
    const result = getCtaForPlacement('tool-result-pdf');
    expect(result).not.toBeNull();
    expect(result?.offer.destination).toBe('portfolio');
  });

  it('resolves CTA for audit destination', () => {
    const result = getCtaForPlacement('tool-result-finance');
    expect(result).not.toBeNull();
    expect(result?.offer.destination).toBe('audit');
  });

  it('returns null for unknown placement', () => {
    const result = getCtaForPlacement('unknown-placement' as any);
    expect(result).toBeNull();
  });

  it('looks up offer by id', () => {
    const offer = getOfferById('audit-free-check');
    expect(offer).toBeDefined();
    expect(offer?.destination).toBe('audit');
    expect(offer?.href).toContain('/sample-report');
  });

  it('trust-page placement routes to audit sample report', () => {
    const result = getCtaForPlacement('trust-page');
    expect(result?.offer.id).toBe('audit-free-check');
    expect(result?.href).toContain('audit.alirezasafaeisystems.ir/sample-report');
    expect(result?.href).toContain('utm_content=trust-page');
  });

  it('looks up placement by id', () => {
    const placement = getPlacementById('premium-gate');
    expect(placement).toBeDefined();
    expect(placement?.id).toBe('premium-gate');
  });

  it('every route has valid placement and offer', () => {
    const placements = getAllPlacements();
    for (const placement of placements) {
      const result = getCtaForPlacement(placement.id);
      expect(result).not.toBeNull();
      expect(result?.offer).toBeDefined();
      expect(result?.href).toContain('utm_source=toolbox');
    }
  });
});
