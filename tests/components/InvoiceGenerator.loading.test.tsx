import { expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import InvoiceGenerator from '@/components/features/finance/InvoiceGenerator';

const imports = vi.hoisted(() => ({ pdf: false, fontkit: false }));

vi.mock('pdf-lib', () => {
  imports.pdf = true;
  return { PDFDocument: {}, rgb: vi.fn() };
});
vi.mock('@pdf-lib/fontkit', () => {
  imports.fontkit = true;
  return { default: {} };
});
vi.mock('@/shared/ui/toast-context', () => ({ useToast: () => ({ showToast: vi.fn() }) }));

// This file intentionally never exports: its module context represents a fresh page visit.
it('renders the invoice form without evaluating either PDF library', () => {
  render(<InvoiceGenerator />);
  expect(screen.getByRole('button', { name: 'دانلود فاکتور PDF' })).toBeEnabled();
  expect(imports.pdf).toBe(false);
  expect(imports.fontkit).toBe(false);
});
