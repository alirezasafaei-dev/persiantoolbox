import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ChatMarkdown from './ChatMarkdown';

describe('ChatMarkdown', () => {
  it('renders headings, lists and isolated copyable code without executing HTML or unsafe links', () => {
    const { container } = render(
      <ChatMarkdown
        text={
          '## عنوان\n\n- مورد\n\n```js\nconst x = 1;\n```\n\n[امن](https://example.com) [ناامن](javascript:alert%281%29)\n\n<img src=x onerror=alert(1)>'
        }
        onCopy={vi.fn()}
      />,
    );
    expect(screen.getByRole('heading', { name: 'عنوان' })).toBeVisible();
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'امن' })).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.queryByRole('link', { name: 'ناامن' })).not.toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('pre')).toHaveAttribute('dir', 'ltr');
    expect(screen.getByRole('button', { name: 'کپی کد' })).toBeVisible();
  });
  it('blocks protocol-relative links and remote image requests', () => {
    const { container } = render(
      <ChatMarkdown
        text={'[رد](//example.com) ![تصویر](https://example.com/private.png)'}
        onCopy={vi.fn()}
      />,
    );
    expect(container.querySelector('a, img')).toBeNull();
    expect(screen.getByText('تصویر')).toBeInTheDocument();
  });
});
