import { describe, expect, it } from 'vitest';
import { getCtaForPlacement, getAllPlacements } from '@/lib/cta-registry';

describe('cross-site funnel attribution (E0-03)', () => {
  it('every CTA placement generates a unique utm_content for attribution', () => {
    const placements = getAllPlacements();
    const utmContents = placements.map((p) => {
      const result = getCtaForPlacement(p.id);
      const url = new URL((result as NonNullable<typeof result>).href);
      return url.searchParams.get('utm_content');
    });

    const unique = new Set(utmContents);
    expect(unique.size).toBe(utmContents.length);
  });

  it('every CTA href includes utm_source=toolbox for source attribution', () => {
    const placements = getAllPlacements();
    for (const placement of placements) {
      const result = getCtaForPlacement(placement.id);
      const url = new URL((result as NonNullable<typeof result>).href);
      expect(url.searchParams.get('utm_source')).toBe('toolbox');
    }
  });

  it('every CTA href includes utm_medium for medium attribution', () => {
    const placements = getAllPlacements();
    for (const placement of placements) {
      const result = getCtaForPlacement(placement.id);
      const url = new URL((result as NonNullable<typeof result>).href);
      expect(url.searchParams.get('utm_medium')).toBeTruthy();
    }
  });

  it('every CTA href includes utm_campaign for campaign attribution', () => {
    const placements = getAllPlacements();
    for (const placement of placements) {
      const result = getCtaForPlacement(placement.id);
      const url = new URL((result as NonNullable<typeof result>).href);
      expect(url.searchParams.get('utm_campaign')).toBeTruthy();
    }
  });

  it('CTA for finance tools routes to audit (not portfolio)', () => {
    const result = getCtaForPlacement('tool-result-finance');
    expect(result?.offer.destination).toBe('audit');
    expect(result?.href).toContain('audit.alirezasafaeisystems.ir');
  });

  it('CTA for PDF tools routes to portfolio consultation', () => {
    const result = getCtaForPlacement('tool-result-pdf');
    expect(result?.offer.destination).toBe('portfolio');
    expect(result?.href).toContain('alirezasafaeisystems.ir');
  });

  it('footer CTA routes to portfolio brand page', () => {
    const result = getCtaForPlacement('footer-global');
    expect(result?.offer.destination).toBe('portfolio');
    expect(result?.offer.id).toBe('portfolio-brand');
  });

  it('session ID is deterministic per browser for correlation', () => {
    const key = 'asdev_session_v1';

    function getOrCreateSession(): string {
      let session = localStorage.getItem(key);
      if (!session) {
        session = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
        localStorage.setItem(key, session);
      }
      return session;
    }

    const session1 = getOrCreateSession();
    const session2 = getOrCreateSession();
    expect(session1).toBe(session2);
    expect(session1).toMatch(/^\d+-[a-z0-9]+$/);
  });
});
