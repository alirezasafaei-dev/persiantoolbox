import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
const state = vi.hoisted(() => ({
  request: vi.fn(),
  confirm: vi.fn(),
  cancel: vi.fn(),
  download: vi.fn(),
}));
vi.mock('@/shared/hooks/useSubscriptionStatus', () => ({
  useSubscriptionStatus: () => ({ isPremium: true, planId: 'pack-3' }),
}));
vi.mock('@/shared/hooks/useExportToken', () => ({
  useExportToken: () => ({
    requestToken: state.request,
    confirmExport: state.confirm,
    cancelReservation: state.cancel,
  }),
}));
vi.mock('@/lib/business-documents/export', () => ({
  downloadPdf: state.download,
  isDocxAvailable: () => false,
}));
vi.mock('@/lib/business-documents/draft-storage', () => ({
  createDraftId: () => 'synthetic',
  canSaveDraft: () => true,
  saveDraft: vi.fn(),
  deleteDraft: vi.fn(),
  loadDrafts: () => [
    {
      id: 'synthetic',
      documentType: 'invoice',
      seller: { name: 'Seller' },
      buyer: { name: 'Buyer' },
      items: [{ id: '1', description: 'Synthetic', quantity: 1, unitPrice: 10 }],
    },
  ],
}));
import DocumentStudio from '@/components/features/business-documents/DocumentStudio';
async function exportButton() {
  render(<DocumentStudio initialDocumentType="invoice" />);
  // Walk the rendered wizard using its final navigation button, not private callbacks.
  for (let i = 0; i < 6 && !screen.queryByRole('checkbox'); i++) {
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[buttons.length - 1]!);
  }
  fireEvent.click(screen.getByRole('checkbox'));
  return screen.getByRole('button', { name: /PDF/ });
}
beforeEach(() => {
  vi.clearAllMocks();
  state.request.mockResolvedValue({ reservationId: 'synthetic-reservation' });
  state.confirm.mockResolvedValue(undefined);
  state.cancel.mockResolvedValue(undefined);
});
it('cancels a reserved credit and never confirms after PDF generation fails', async () => {
  state.download.mockRejectedValueOnce(new Error('font failed'));
  fireEvent.click(await exportButton());
  await waitFor(() => expect(state.cancel).toHaveBeenCalledWith('synthetic-reservation'));
  expect(state.confirm).not.toHaveBeenCalled();
});
it('does not reserve twice while one PDF download is pending', async () => {
  let finish: () => void = () => {};
  state.download.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  const button = await exportButton();
  fireEvent.click(button);
  fireEvent.click(button);
  await waitFor(() => expect(state.download).toHaveBeenCalled());
  expect(state.request).toHaveBeenCalledTimes(1);
  finish();
  await waitFor(() => expect(state.confirm).toHaveBeenCalledWith('synthetic-reservation'));
});
