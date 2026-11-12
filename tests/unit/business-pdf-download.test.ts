import { afterEach, expect, it, vi } from 'vitest';
import { downloadPdf } from '@/lib/business-documents/export';
import type { BusinessDocumentDraft } from '@/lib/business-documents/types';
const generate = vi.hoisted(() => vi.fn());
vi.mock('@/lib/business-documents/pdf', () => ({ createBusinessPdfBytes: generate }));
const draft = { id: 'synthetic' } as BusinessDocumentDraft;
const totals = { subtotal: 0, discountAmount: 0, taxAmount: 0, grandTotal: 0 };
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
it('rejects generation errors without attempting a file download', async () => {
  generate.mockRejectedValueOnce(new Error('font unavailable'));
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  await expect(downloadPdf(draft, totals, 'test.pdf')).rejects.toThrow('font unavailable');
  expect(click).not.toHaveBeenCalled();
});
it('downloads PDF bytes without opening a print popup', async () => {
  vi.useFakeTimers();
  generate.mockResolvedValueOnce(new Uint8Array([37, 80, 68, 70, 45]));
  const create = vi.fn().mockReturnValue('blob:synthetic');
  const revoke = vi.fn();
  vi.stubGlobal('URL', { createObjectURL: create, revokeObjectURL: revoke });
  const popup = vi.spyOn(window, 'open');
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  await downloadPdf(draft, totals, 'test');
  expect(create).toHaveBeenCalledWith(expect.objectContaining({ type: 'application/pdf' }));
  expect(click).toHaveBeenCalledOnce();
  expect(popup).not.toHaveBeenCalled();
  await vi.runAllTimersAsync();
  expect(revoke).toHaveBeenCalledWith('blob:synthetic');
});
