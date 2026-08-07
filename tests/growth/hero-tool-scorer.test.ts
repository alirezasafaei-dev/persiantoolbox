import { describe, it, expect } from 'vitest';
import { calculateScore, WEIGHTS, type ToolScore } from '../../scripts/growth/hero-tool-scorer';

describe('Hero Tool Scorer', () => {
  const baseTool: Omit<ToolScore, 'score'> = {
    id: 'test-tool',
    path: '/test',
    title: 'Test Tool',
    cluster: 'test_tools',
    gsc: { clicks28d: 20, impressions28d: 200, ctr: 0.1, avgPosition: 5 },
    product: { starts: 100, completions: 80, completionRate: 0.8 },
    social: { reach: 500, saves: 10, shares: 5 },
    status: 'Test',
    strategy: 'Test strategy',
    priority: 'medium',
  };

  describe('calculateScore', () => {
    it('returns a number between 0 and 100', () => {
      const score = calculateScore(baseTool);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('does not produce NaN', () => {
      const score = calculateScore(baseTool);
      expect(Number.isFinite(score)).toBe(true);
    });

    it('ranks high-impression tool above low-impression tool', () => {
      const highImpression: Omit<ToolScore, 'score'> = {
        ...baseTool,
        id: 'high',
        gsc: { clicks28d: 40, impressions28d: 350, ctr: 0.11, avgPosition: 2 },
      };
      const lowImpression: Omit<ToolScore, 'score'> = {
        ...baseTool,
        id: 'low',
        gsc: { clicks28d: 2, impressions28d: 20, ctr: 0.1, avgPosition: 15 },
      };
      expect(calculateScore(highImpression)).toBeGreaterThan(calculateScore(lowImpression));
    });

    it('ranks high-CTR tool above low-CTR tool', () => {
      const highCTR: Omit<ToolScore, 'score'> = {
        ...baseTool,
        id: 'high-ctr',
        gsc: { clicks28d: 20, impressions28d: 100, ctr: 0.5, avgPosition: 3 },
      };
      const lowCTR: Omit<ToolScore, 'score'> = {
        ...baseTool,
        id: 'low-ctr',
        gsc: { clicks28d: 20, impressions28d: 100, ctr: 0.02, avgPosition: 3 },
      };
      expect(calculateScore(highCTR)).toBeGreaterThan(calculateScore(lowCTR));
    });

    it('ranks high-completion tool above low-completion tool', () => {
      const highCompletion: Omit<ToolScore, 'score'> = {
        ...baseTool,
        id: 'high-completion',
        product: { starts: 100, completions: 95, completionRate: 0.95 },
      };
      const lowCompletion: Omit<ToolScore, 'score'> = {
        ...baseTool,
        id: 'low-completion',
        product: { starts: 100, completions: 50, completionRate: 0.5 },
      };
      expect(calculateScore(highCompletion)).toBeGreaterThan(calculateScore(lowCompletion));
    });

    it('handles zero impressions gracefully', () => {
      const zeroImpressions: Omit<ToolScore, 'score'> = {
        ...baseTool,
        gsc: { clicks28d: 0, impressions28d: 0, ctr: 0, avgPosition: 50 },
      };
      const score = calculateScore(zeroImpressions);
      expect(Number.isFinite(score)).toBe(true);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('handles zero clicks gracefully', () => {
      const zeroClicks: Omit<ToolScore, 'score'> = {
        ...baseTool,
        gsc: { clicks28d: 0, impressions28d: 100, ctr: 0, avgPosition: 10 },
      };
      const score = calculateScore(zeroClicks);
      expect(Number.isFinite(score)).toBe(true);
    });

    it('handles missing social data', () => {
      const noSocial: Omit<ToolScore, 'score'> = {
        ...baseTool,
        social: { reach: 0, saves: 0, shares: 0 },
      };
      const score = calculateScore(noSocial);
      expect(Number.isFinite(score)).toBe(true);
    });

    it('handles strong completion but low search volume', () => {
      const strongCompletionLowSearch: Omit<ToolScore, 'score'> = {
        ...baseTool,
        id: 'niche',
        gsc: { clicks28d: 1, impressions28d: 10, ctr: 0.1, avgPosition: 20 },
        product: { starts: 50, completions: 48, completionRate: 0.96 },
      };
      const score = calculateScore(strongCompletionLowSearch);
      expect(Number.isFinite(score)).toBe(true);
      expect(score).toBeGreaterThan(0);
    });

    it('handles high impressions with poor CTR', () => {
      const highImpressionPoorCTR: Omit<ToolScore, 'score'> = {
        ...baseTool,
        id: 'poor-ctr',
        gsc: { clicks28d: 3, impressions28d: 300, ctr: 0.01, avgPosition: 8 },
      };
      const score = calculateScore(highImpressionPoorCTR);
      expect(Number.isFinite(score)).toBe(true);
    });

    it('score is deterministic', () => {
      const score1 = calculateScore(baseTool);
      const score2 = calculateScore(baseTool);
      expect(score1).toBe(score2);
    });
  });

  describe('WEIGHTS', () => {
    it('weights sum to 1.0', () => {
      const sum = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 10);
    });

    it('has all required weight keys', () => {
      expect(WEIGHTS).toHaveProperty('searchImpressions');
      expect(WEIGHTS).toHaveProperty('searchClicks');
      expect(WEIGHTS).toHaveProperty('ctr');
      expect(WEIGHTS).toHaveProperty('avgPosition');
      expect(WEIGHTS).toHaveProperty('productStarts');
      expect(WEIGHTS).toHaveProperty('completionRate');
      expect(WEIGHTS).toHaveProperty('socialPerformance');
      expect(WEIGHTS).toHaveProperty('monetizationIntent');
    });

    it('all weights are between 0 and 1', () => {
      for (const weight of Object.values(WEIGHTS)) {
        expect(weight).toBeGreaterThanOrEqual(0);
        expect(weight).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('edge cases', () => {
    it('handles very high position (bad ranking)', () => {
      const badPosition: Omit<ToolScore, 'score'> = {
        ...baseTool,
        gsc: { clicks28d: 0, impressions28d: 100, ctr: 0, avgPosition: 100 },
      };
      const score = calculateScore(badPosition);
      expect(Number.isFinite(score)).toBe(true);
    });

    it('handles position 1 (best ranking)', () => {
      const bestPosition: Omit<ToolScore, 'score'> = {
        ...baseTool,
        gsc: { clicks28d: 40, impressions28d: 350, ctr: 0.5, avgPosition: 1 },
      };
      const score = calculateScore(bestPosition);
      expect(score).toBeGreaterThan(70);
    });

    it('handles maximum social engagement', () => {
      const maxSocial: Omit<ToolScore, 'score'> = {
        ...baseTool,
        social: { reach: 10000, saves: 500, shares: 200 },
      };
      const score = calculateScore(maxSocial);
      expect(Number.isFinite(score)).toBe(true);
    });
  });
});
