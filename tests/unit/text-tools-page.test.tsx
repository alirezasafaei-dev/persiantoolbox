import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TextToolsPage from '@/components/features/text-tools/TextToolsPage';

describe('TextToolsPage landing page', () => {
  it('renders tool cards with links to individual pages', () => {
    render(<TextToolsPage />);

    expect(screen.getByText('شمارشگر کلمات')).toBeInTheDocument();
    expect(screen.getByText('تبدیل اعداد')).toBeInTheDocument();
    expect(screen.getByText('حذف فاصله‌های اضافی')).toBeInTheDocument();
    expect(screen.getByText('تبدیل حروف')).toBeInTheDocument();

    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/text-tools/word-counter');
    expect(hrefs).toContain('/text-tools/number-converter');
    expect(hrefs).toContain('/text-tools/remove-spaces');
    expect(hrefs).toContain('/text-tools/case-converter');
  });

  it('does not render inline tool controls', () => {
    render(<TextToolsPage />);

    expect(screen.queryByText('تبدیل تاریخ')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', { name: 'تاریخ شمسی (YYYY/MM/DD)' }),
    ).not.toBeInTheDocument();
  });
});
