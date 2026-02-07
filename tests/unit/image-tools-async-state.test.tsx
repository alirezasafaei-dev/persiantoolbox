import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import ImageToolsPage from '@/features/image-tools/image-tools';

const compressMock = vi.fn();

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

vi.mock('@/features/image-tools/components/ImageDropzone', () => ({
  default: ({ onFilesSelected }: { onFilesSelected: (files: FileList | null) => void }) => (
    <button
      type="button"
      onClick={() => {
        const file = Object.assign(new File(['test'], 'sample.jpg', { type: 'image/jpeg' }), {
          arrayBuffer: async () => new ArrayBuffer(8),
        });
        const fileList = {
          0: file,
          length: 1,
          item: (index: number) => (index === 0 ? file : null),
        } as unknown as FileList;
        onFilesSelected(fileList);
      }}
    >
      add-file
    </button>
  ),
}));

vi.mock('@/features/image-tools/hooks/useImageToolsWorker', () => ({
  useImageToolsWorker: () => ({
    compress: compressMock,
    mode: 'worker',
  }),
}));

vi.mock('@/shared/ui/toast-context', () => ({
  useToast: () => ({
    showToast: vi.fn(),
    recordCopy: vi.fn(),
  }),
}));

vi.mock('@/shared/history/recordHistory', () => ({
  recordHistory: vi.fn(),
}));

vi.mock('@/components/features/history/RecentHistoryCard', () => ({
  default: () => <div data-testid="recent-history-card" />,
}));

describe('ImageToolsPage AsyncState regressions', () => {
  const createObjectUrl = vi.fn(() => 'blob:test-url');
  const revokeObjectUrl = vi.fn();

  beforeAll(() => {
    vi.stubGlobal(
      'URL',
      Object.assign(URL, {
        createObjectURL: createObjectUrl,
        revokeObjectURL: revokeObjectUrl,
      }),
    );
    vi.stubGlobal(
      'Image',
      class {
        onload: (() => void) | null = null;
        set src(_: string) {
          this.onload?.();
        }
        get naturalWidth() {
          return 1000;
        }
        get naturalHeight() {
          return 800;
        }
      },
    );
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('shows AsyncState error when compression fails', async () => {
    compressMock.mockRejectedValueOnce(new Error('compression failed'));
    const user = userEvent.setup();

    render(<ImageToolsPage />);

    await user.click(screen.getByRole('button', { name: 'add-file' }));
    await user.click(screen.getByRole('button', { name: 'پردازش' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('خطا در فشرده‌سازی');
    expect(alert).toHaveTextContent('compression failed');
  });
});
