import { describe, it, expect } from 'vitest';
import { calculateScore, WEIGHTS, type ToolScore } from '../../scripts/growth/hero-tool-scorer';

describe('Hero Tool Scorer v2', () => {
  const baseTool: Omit<ToolScore, 'score' | 'sources' | 'componentScores'> = {
    id: 'test-tool',
    path: '/test',
    title: 'Test Tool',
    cluster: 'test_tools',
    gsc: { clicks28d: 20, impressions28d: 200, ctr: 0.1, avgPosition: 5 },
    product: { starts: 0, completions: 0, completionRate: 0 },
    social: { reach: 0, saves: 0, shares: 0 },
    status: 'Test',
    strategy: 'Test strategy',
    priority: 'medium',
  };

  const fullReweighting: Record<string, number> = {
    searchImpressions: 0.25,
    searchClicks: 0.2,
    ctr: 0.1,
    avgPosition: 0.15,
    productStarts: 0.1,
    completionRate: 0.1,
    socialPerformance: 0.05,
    monetizationIntent: 0.05,
  };

  describe('calculateScore', () => {
    it('returns a number between 0 and 100', () => {
      const score = calculateScore(baseTool, fullReweighting);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('does not produce NaN', () => {
      const score = calculateScore(baseTool, fullReweighting);
      expect(Number.isFinite(score)).toBe(true);
    });

    it('ranks high-impression tool above low-impression tool', () => {
      const highImpression: Omit<ToolScore, 'score' | 'sources' | 'componentScores'> = {
        ...baseTool,
        id: 'high',
        gsc: { clicks28d: 40, impressions28d: 350, ctr: 0.11, avgPosition: 2 },
      };
      const lowImpression: Omit<ToolScore, 'score' | 'sources' | 'componentScores'> = {
        ...baseTool,
        id: 'low',
        gsc: { clicks28d: 2, impressions28d: 20, ctr: 0.1, avgPosition: 15 },
      };
      expect(calculateScore(highImpression, fullReweighting)).toBeGreaterThan(
        calculateScore(lowImpression, fullReweighting),
      );
    });

    it('ranks high-CTR tool above low-CTR tool', () => {
      const highCTR: Omit<ToolScore, 'score' | 'sources' | 'componentScores'> = {
        ...baseTool,
        id: 'high-ctr',
        gsc: { clicks28d: 20, impressions28d: 100, ctr: 0.5, avgPosition: 3 },
      };
      const lowCTR: Omit<ToolScore, 'score' | 'sources' | 'componentScores'> = {
        ...baseTool,
        id: 'low-ctr',
        gsc: { clicks28d: 20, impressions28d: 100, ctr: 0.02, avgPosition: 3 },
      };
      expect(calculateScore(highCTR, fullReweighting)).toBeGreaterThan(
        calculateScore(lowCTR, fullReweighting),
      );
    });

    it('handles zero impressions gracefully', () => {
      const zeroImpressions: Omit<ToolScore, 'score' | 'sources' | 'componentScores'> = {
        ...baseTool,
        gsc: { clicks28d: 0, impressions28d: 0, ctr: 0, avgPosition: 50 },
      };
      const score = calculateScore(zeroImpressions, fullReweighting);
      expect(Number.isFinite(score)).toBe(true);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('handles zero clicks gracefully', () => {
      const zeroClicks: Omit<ToolScore, 'score' | 'sources' | 'componentScores'> = {
        ...baseTool,
        gsc: { clicks28d: 0, impressions28d: 100, ctr: 0, avgPosition: 10 },
      };
      const score = calculateScore(zeroClicks, fullReweighting);
      expect(Number.isFinite(score)).toBe(true);
    });

    it('handles reweighting with unavailable dimensions', () => {
      const gscOnlyReweighting: Record<string, number> = {
        searchImpressions: 0.3125,
        searchClicks: 0.25,
        ctr: 0.125,
        avgPosition: 0.1875,
        productStarts: 0,
        completionRate: 0,
        socialPerformance: 0,
        monetizationIntent: 0,
      };
      const score = calculateScore(baseTool, gscOnlyReweighting);
      expect(Number.isFinite(score)).toBe(true);
      expect(score).toBeGreaterThan(0);
    });

    it('score is deterministic', () => {
      const score1 = calculateScore(baseTool, fullReweighting);
      const score2 = calculateScore(baseTool, fullReweighting);
      expect(score1).toBe(score2);
    });

    it('handles very high position (bad ranking)', () => {
      const badPosition: Omit<ToolScore, 'score' | 'sources' | 'componentScores'> = {
        ...baseTool,
        gsc: { clicks28d: 0, impressions28d: 100, ctr: 0, avgPosition: 100 },
      };
      const score = calculateScore(badPosition, fullReweighting);
      expect(Number.isFinite(score)).toBe(true);
    });

    it('handles position 1 (best ranking)', () => {
      const bestPosition: Omit<ToolScore, 'score' | 'sources' | 'componentScores'> = {
        ...baseTool,
        gsc: { clicks28d: 40, impressions28d: 350, ctr: 0.5, avgPosition: 1 },
      };
      const score = calculateScore(bestPosition, fullReweighting);
      expect(score).toBeGreaterThan(50);
    });
  });

  describe('WEIGHTS', () => {
    it('weights sum to 1.0', () => {
      const sum = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 10);
    });

    it('all weights are between 0 and 1', () => {
      for (const weight of Object.values(WEIGHTS)) {
        expect(weight).toBeGreaterThanOrEqual(0);
        expect(weight).toBeLessThanOrEqual(1);
      }
    });
  });
});
