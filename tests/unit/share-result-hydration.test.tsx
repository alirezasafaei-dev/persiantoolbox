import { act } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ShareResult from '@/components/ui/ShareResult';

afterEach(() => vi.unstubAllGlobals());

describe('ShareResult hydration', () => {
  it('hydrates when native sharing exists only in the browser', async () => {
    const browserNavigator = navigator;
    const browserShare = vi.fn().mockResolvedValue(undefined);
    const props = { title: 'آزمون', text: 'نمونه' };
    vi.stubGlobal('navigator', undefined);
    const html = renderToString(<ShareResult {...props} />);
    vi.stubGlobal('navigator', { ...browserNavigator, share: browserShare });
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.append(container);
    const recovered: unknown[] = [];
    let root!: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, <ShareResult {...props} />, {
        onRecoverableError: (error) => recovered.push(error),
      });
    });
    expect(recovered).toEqual([]);
    expect(container.querySelector('[aria-label="اشتراک‌گذاری"]')).not.toBeNull();
    expect(browserShare).not.toHaveBeenCalled();
    await act(async () => root.unmount());
    container.remove();
  });
});
