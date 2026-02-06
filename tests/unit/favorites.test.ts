import { describe, it, expect, beforeEach } from 'vitest';
import { getFavorites, toggleFavorite, clearFavorites } from '@/shared/analytics/favorites';

describe('favorites storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty list by default', () => {
    expect(getFavorites()).toEqual([]);
  });

  it('toggles favorites on and off', () => {
    expect(toggleFavorite('/loan')).toEqual(['/loan']);
    expect(getFavorites()).toEqual(['/loan']);
    expect(toggleFavorite('/loan')).toEqual([]);
    expect(getFavorites()).toEqual([]);
  });

  it('keeps insertion order with newest first', () => {
    toggleFavorite('/loan');
    toggleFavorite('/salary');
    expect(getFavorites()).toEqual(['/salary', '/loan']);
  });

  it('clears favorites', () => {
    toggleFavorite('/loan');
    clearFavorites();
    expect(getFavorites()).toEqual([]);
  });
});
