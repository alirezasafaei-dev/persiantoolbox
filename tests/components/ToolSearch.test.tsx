import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ToolSearch from '@/components/home/ToolSearch';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/tool-search', () => ({
  searchTools: () => [],
}));

vi.mock('@/shared/analytics/events', () => ({
  trackAnalyticsEvent: vi.fn(),
  ANALYTICS_EVENTS: { SEARCH_USE: 'search_use' },
}));

describe('ToolSearch', () => {
  it('renders search input', () => {
    render(<ToolSearch />);
    expect(screen.getByRole('combobox')).toBeDefined();
  });

  it('renders placeholder text', () => {
    render(<ToolSearch />);
    expect(screen.getByPlaceholderText(/ابزاری می‌گردید/)).toBeDefined();
  });

  it('updates input value on typing', () => {
    render(<ToolSearch />);
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'وام' } });
    expect(input).toHaveValue('وام');
  });
});
