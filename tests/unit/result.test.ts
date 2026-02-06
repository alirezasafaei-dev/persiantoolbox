import { describe, it, expect } from 'vitest';
import { ok, fail, fromError } from '@/shared/utils/result';

describe('result utils', () => {
  it('creates ok results', () => {
    expect(ok(42)).toEqual({ ok: true, data: 42 });
  });

  it('creates fail results with optional details', () => {
    expect(fail('oops')).toEqual({
      ok: false,
      error: { code: 'ERROR', message: 'oops' },
    });

    expect(fail('bad', 'INVALID', { field: 'name' })).toEqual({
      ok: false,
      error: { code: 'INVALID', message: 'bad', details: { field: 'name' } },
    });
  });

  it('creates results from errors', () => {
    const errorResult = fromError(new Error('boom'), 'fallback', 'E1');
    expect(errorResult).toEqual({
      ok: false,
      error: { code: 'E1', message: 'boom' },
    });

    const unknownResult = fromError({ reason: 'bad' }, 'fallback', 'E2');
    expect(unknownResult).toEqual({
      ok: false,
      error: { code: 'E2', message: 'fallback', details: { reason: 'bad' } },
    });
  });
});
