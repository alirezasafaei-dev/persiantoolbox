import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ToolShowcase from '@/components/home/ToolShowcase';

vi.mock('@/shared/analytics/localUsage', () => ({
  getUsageSnapshot: () => ({ paths: {} }),
}));

vi.mock('@/shared/constants/home-tools', () => ({
  homeToolIndex: [
    {
      id: 't1',
      path: '/tool1',
      title: 'ابزار اول',
      description: 'توضیح اول',
      icon: '📄',
      iconWrapClassName: '',
    },
    {
      id: 't2',
      path: '/tool2',
      title: 'ابزار دوم',
      description: 'توضیح دوم',
      icon: '💰',
      iconWrapClassName: '',
    },
  ],
  HomeToolEntry: {},
}));

vi.mock('@/shared/ui/ToolCard', () => ({
  default: ({ href, title }: { href: string; title: string }) => <a href={href}>{title}</a>,
}));

describe('ToolShowcase', () => {
  it('renders showcase section', () => {
    render(<ToolShowcase />);
    expect(screen.getByText(/پرتقاضا/)).toBeDefined();
  });

  it('renders tool cards', () => {
    render(<ToolShowcase />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });
});
