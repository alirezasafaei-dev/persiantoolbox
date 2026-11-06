import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PersianOcr from '@/components/features/pdf-tools/PersianOcr';

let hydratedRoot: Root | undefined;
let hydrationContainer: HTMLDivElement | undefined;

afterEach(async () => {
  if (hydratedRoot) await act(async () => hydratedRoot?.unmount());
  hydratedRoot = undefined;
  hydrationContainer?.remove();
  hydrationContainer = undefined;
  cleanup();
  vi.unstubAllGlobals();
});

async function hydrateWithSelectedFile(file: File) {
  const container = document.createElement('div');
  hydrationContainer = container;
  container.innerHTML = renderToString(<PersianOcr />);
  document.body.append(container);
  const input = container.querySelector('input[type="file"]');
  if (!input) throw new Error('Server-rendered file input missing');
  Object.defineProperty(input, 'files', { configurable: true, value: [file] });
  await act(async () => {
    hydratedRoot = hydrateRoot(container, <PersianOcr />);
  });
}

describe('Persian OCR file selection', () => {
  it('preserves an image selected in server HTML before hydration', async () => {
    await hydrateWithSelectedFile(
      new File(['synthetic image'], 'early.png', { type: 'image/png' }),
    );
    expect(await screen.findByText('early.png')).toBeVisible();
    expect(screen.getByAltText('پیش‌نمایش تصویر')).toHaveAttribute(
      'src',
      expect.stringMatching(/^data:image\/png;base64,/),
    );
    expect(screen.getByRole('button', { name: /^استخراج متن$/ })).toBeEnabled();
  });

  it('validates a non-image selected before hydration', async () => {
    await hydrateWithSelectedFile(
      new File(['synthetic text'], 'early.txt', { type: 'text/plain' }),
    );
    expect(await screen.findByText('لطفاً یک فایل تصویری انتخاب کنید')).toBeVisible();
    expect(screen.queryByAltText('پیش‌نمایش تصویر')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^استخراج متن$/ })).toBeDisabled();
  });

  it('still handles file changes after hydration', async () => {
    render(<PersianOcr />);
    fireEvent.change(screen.getByLabelText('انتخاب فایل تصویری', { exact: true }), {
      target: { files: [new File(['synthetic image'], 'normal.png', { type: 'image/png' })] },
    });
    expect(await screen.findByText('normal.png')).toBeVisible();
    expect(screen.getByRole('button', { name: /^استخراج متن$/ })).toBeEnabled();
  });

  it('keeps the preview paired with the newest file when earlier reads finish late', async () => {
    const readers: DeferredReader[] = [];
    class DeferredReader {
      result: string | null = null;
      onload: (() => void) | null = null;
      readAsDataURL() {
        readers.push(this);
      }
      finish(value: string) {
        this.result = value;
        this.onload?.();
      }
    }
    vi.stubGlobal('FileReader', DeferredReader);
    const finishReader = (index: number, value: string) => {
      const reader = readers[index];
      if (!reader) throw new Error(`FileReader ${index} was not started`);
      act(() => reader.finish(value));
    };
    await hydrateWithSelectedFile(new File(['first'], 'early.png', { type: 'image/png' }));
    const input = screen.getByLabelText('انتخاب فایل تصویری', { exact: true });
    fireEvent.change(input, {
      target: { files: [new File(['second'], 'newest.png', { type: 'image/png' })] },
    });
    finishReader(1, 'data:image/png;base64,c2Vjb25k');
    expect(screen.getByText('newest.png')).toBeVisible();
    finishReader(0, 'data:image/png;base64,Zmlyc3Q=');
    expect(screen.getByAltText('پیش‌نمایش تصویر')).toHaveAttribute(
      'src',
      'data:image/png;base64,c2Vjb25k',
    );
    fireEvent.change(input, {
      target: { files: [new File(['third'], 'third.png', { type: 'image/png' })] },
    });
    expect(screen.queryByAltText('پیش‌نمایش تصویر')).not.toBeInTheDocument();
    finishReader(2, 'data:image/png;base64,dGhpcmQ=');
    expect(screen.getByText('third.png')).toBeVisible();
    expect(screen.getByAltText('پیش‌نمایش تصویر')).toHaveAttribute(
      'src',
      'data:image/png;base64,dGhpcmQ=',
    );
  });
});
