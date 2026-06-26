import { describe, it, expect } from 'vitest';
import {
  rentalClauses,
  constructionClauses,
  getClausesForTemplate,
  getClausesByCategory,
  clauseCategories,
} from '@/lib/contract-tools/clauses';

describe('Safe Clause Library', () => {
  describe('Rental Clauses', () => {
    it('has at least 8 clauses', () => {
      expect(rentalClauses.length).toBeGreaterThanOrEqual(8);
    });

    it('all clauses have required fields', () => {
      for (const clause of rentalClauses) {
        expect(clause.id).toBeTruthy();
        expect(clause.category).toBeTruthy();
        expect(clause.title).toBeTruthy();
        expect(clause.text).toBeTruthy();
        expect(clause.appliesTo).toContain('rental-lease');
        expect(['low', 'medium', 'high']).toContain(clause.riskLevel);
        expect(clause.reviewStatus).toBe('needs-review');
      }
    });

    it('has obligations category', () => {
      const obligations = rentalClauses.filter((c) => c.category === 'obligations');
      expect(obligations.length).toBeGreaterThan(0);
    });

    it('has financial category', () => {
      const financial = rentalClauses.filter((c) => c.category === 'financial');
      expect(financial.length).toBeGreaterThan(0);
    });

    it('has termination category', () => {
      const termination = rentalClauses.filter((c) => c.category === 'termination');
      expect(termination.length).toBeGreaterThan(0);
    });

    it('has dispute category', () => {
      const dispute = rentalClauses.filter((c) => c.category === 'dispute');
      expect(dispute.length).toBeGreaterThan(0);
    });

    it('no duplicate IDs', () => {
      const ids = rentalClauses.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('Construction Clauses', () => {
    it('has at least 8 clauses', () => {
      expect(constructionClauses.length).toBeGreaterThanOrEqual(8);
    });

    it('all clauses have required fields', () => {
      for (const clause of constructionClauses) {
        expect(clause.id).toBeTruthy();
        expect(clause.appliesTo).toContain('construction-contractor');
      }
    });

    it('has insurance category', () => {
      const insurance = constructionClauses.filter((c) => c.category === 'insurance');
      expect(insurance.length).toBeGreaterThan(0);
    });

    it('has confidentiality category', () => {
      const confidentiality = constructionClauses.filter((c) => c.category === 'confidentiality');
      expect(confidentiality.length).toBeGreaterThan(0);
    });
  });

  describe('getClausesForTemplate', () => {
    it('returns rental clauses for rental-lease', () => {
      const clauses = getClausesForTemplate('rental-lease');
      expect(clauses.length).toBeGreaterThan(0);
      expect(clauses.every((c) => c.appliesTo.includes('rental-lease'))).toBe(true);
    });

    it('returns construction clauses for construction-contractor', () => {
      const clauses = getClausesForTemplate('construction-contractor');
      expect(clauses.length).toBeGreaterThan(0);
      expect(clauses.every((c) => c.appliesTo.includes('construction-contractor'))).toBe(true);
    });

    it('returns empty for unknown template', () => {
      const clauses = getClausesForTemplate('unknown');
      expect(clauses).toHaveLength(0);
    });
  });

  describe('getClausesByCategory', () => {
    it('filters by category', () => {
      const financial = getClausesByCategory('rental-lease', 'financial');
      expect(financial.every((c) => c.category === 'financial')).toBe(true);
    });

    it('returns empty for non-matching category', () => {
      const insurance = getClausesByCategory('rental-lease', 'insurance');
      expect(insurance).toHaveLength(0);
    });
  });

  describe('Clause categories', () => {
    it('has all 7 categories', () => {
      expect(Object.keys(clauseCategories)).toHaveLength(7);
    });

    it('all categories have Persian labels', () => {
      for (const [, label] of Object.entries(clauseCategories)) {
        expect(label.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Risk levels', () => {
    it('has mix of risk levels in rental clauses', () => {
      const risks = new Set(rentalClauses.map((c) => c.riskLevel));
      expect(risks.size).toBeGreaterThanOrEqual(2);
    });

    it('high-risk clauses exist', () => {
      const highRisk = rentalClauses.filter((c) => c.riskLevel === 'high');
      expect(highRisk.length).toBeGreaterThan(0);
    });
  });
});
