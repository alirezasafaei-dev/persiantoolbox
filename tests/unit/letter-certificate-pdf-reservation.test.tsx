import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import FormalLetterForm from '@/components/features/formal-letter/FormalLetterForm';
import WorkCertificateForm from '@/components/features/work-certificate/WorkCertificateForm';
import type * as CertificateDraftStorage from '@/lib/work-certificate/draft-storage';
import type * as LetterDraftStorage from '@/lib/formal-letter/draft-storage';

vi.mock('@/shared/hooks/useSubscriptionStatus', () => ({
  useSubscriptionStatus: () => ({ isPremium: true }),
}));

const state = vi.hoisted(() => ({
  reserve: vi.fn(),
  confirm: vi.fn(),
  cancel: vi.fn(),
  download: vi.fn(),
}));

vi.mock('@/shared/hooks/useExportToken', () => ({
  useExportToken: () => ({
    requestToken: state.reserve,
    confirmExport: state.confirm,
    cancelReservation: state.cancel,
  }),
}));
vi.mock('@/lib/document-pdf/download', () => ({ downloadDocumentPdf: state.download }));
vi.mock('@/lib/work-certificate/draft-storage', async (original) => ({
  ...(await original<typeof CertificateDraftStorage>()),
  loadDrafts: () => [
    {
      data: {
        employeeName: 'Synthetic Employee',
        employerName: 'Synthetic Employer',
        position: 'Engineer',
        startDate: '2025-01-01',
        isCurrent: true,
        issuerName: 'Synthetic Issuer',
        issuerPosition: 'HR Manager',
        certificateDate: '2026-11-13',
        templateId: 'formal',
      },
    },
  ],
}));
vi.mock('@/lib/formal-letter/draft-storage', async (original) => ({
  ...(await original<typeof LetterDraftStorage>()),
  loadDrafts: () => [
    {
      data: {
        senderName: 'Synthetic Sender',
        recipientName: 'Synthetic Recipient',
        letterType: 'request',
        subject: 'Synthetic subject',
        salutation: 'Greetings',
        body: 'Synthetic body',
        closing: 'Thank you',
        letterDate: '2026-11-13',
        additionalParagraphs: [],
        templateId: 'formal',
      },
    },
  ],
}));

beforeEach(() => {
  vi.resetAllMocks();
  state.reserve.mockResolvedValue({ reservationId: 'synthetic-reservation' });
});

it.each([
  ['work-certificate', WorkCertificateForm],
  ['formal-letter', FormalLetterForm],
] as const)(
  '%s cancels a failed PDF and confirms a successful retry once',
  async (product, Form) => {
    render(<Form />);
    fireEvent.click(screen.getByRole('button', { name: 'دانلود' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'تأیید سلب مسئولیت' }));
    const button = screen.getByRole('button', { name: /PDF/ });
    state.download.mockRejectedValueOnce(new Error('font failed'));
    fireEvent.click(button);
    await waitFor(() => expect(state.cancel).toHaveBeenCalledWith('synthetic-reservation'));
    expect(state.confirm).not.toHaveBeenCalled();
    expect(state.reserve).toHaveBeenCalledWith(product);
    await waitFor(() => expect(button).toBeEnabled());

    let finish = () => {};
    state.download.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    fireEvent.click(button);
    fireEvent.click(button);
    await waitFor(() => expect(state.download).toHaveBeenCalledTimes(2));
    expect(state.reserve).toHaveBeenCalledTimes(2);
    expect(state.confirm).not.toHaveBeenCalled();
    finish();
    await waitFor(() => expect(state.confirm).toHaveBeenCalledWith('synthetic-reservation'));
    expect(state.confirm).toHaveBeenCalledTimes(1);
  },
);
