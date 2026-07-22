import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SocialProofStats from '@/components/home/SocialProofStats';

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('SocialProofStats', () => {
  it('renders stats section after fetch', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => ({
        totalViews: 50000,
        totalCalculations: 12000,
        pdfFilesProcessed: 8000,
        financeCalculations: 3000,
      }),
    } as Response);

    render(<SocialProofStats />);
    await waitFor(() => {
      expect(screen.getByText(/بازدید کل/)).toBeDefined();
    });
  });

  it('renders stat labels after fetch', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => ({
        totalViews: 50000,
        totalCalculations: 12000,
        pdfFilesProcessed: 8000,
        financeCalculations: 3000,
      }),
    } as Response);

    render(<SocialProofStats />);
    await waitFor(() => {
      expect(screen.getByText(/محاسبه انجام شده/)).toBeDefined();
    });
  });
});
