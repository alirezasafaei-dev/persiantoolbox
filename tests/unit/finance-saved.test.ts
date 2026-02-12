import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearSavedFinanceCalculations,
  getSavedFinanceCalculations,
  saveFinanceCalculation,
} from '@/shared/analytics/financeSaved';

describe('finance saved calculations', () => {
  beforeEach(() => {
    clearSavedFinanceCalculations();
  });

  it('saves and reads finance calculations from local storage', () => {
    saveFinanceCalculation({
      tool: 'loan',
      title: 'وام سناریو ۱',
      summary: 'قسط: ۱,۰۰۰,۰۰۰ تومان',
    });

    const items = getSavedFinanceCalculations();
    expect(items.length).toBe(1);
    expect(items[0]?.tool).toBe('loan');
    expect(items[0]?.title).toContain('وام');
  });
});
