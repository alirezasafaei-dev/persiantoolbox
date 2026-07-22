import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TestimonialsSection from '@/components/home/TestimonialsSection';

vi.mock('@/lib/testimonials', () => ({
  testimonials: [
    {
      id: '1',
      name: 'علی رضایی',
      role: 'حسابدار',
      quote: 'ابزار فاکتورساز عالیه',
      initials: 'ع ر',
      rating: 5,
      feature: 'فاکتورساز',
    },
    {
      id: '2',
      name: 'سارا احمدی',
      role: 'فریلنسر',
      quote: 'رزومه‌ساز حرفه‌ای',
      initials: 'س ا',
      rating: 4,
      feature: 'رزومه‌ساز',
    },
  ],
}));

describe('TestimonialsSection', () => {
  it('renders section title', () => {
    render(<TestimonialsSection />);
    expect(screen.getByText(/نظرات کاربران/)).toBeDefined();
  });

  it('renders all testimonials', () => {
    render(<TestimonialsSection />);
    expect(screen.getByText('علی رضایی')).toBeDefined();
    expect(screen.getByText('سارا احمدی')).toBeDefined();
  });

  it('renders testimonial quotes', () => {
    render(<TestimonialsSection />);
    expect(screen.getByText(/ابزار فاکتورساز عالیه/)).toBeDefined();
    expect(screen.getByText(/رزومه‌ساز حرفه‌ای/)).toBeDefined();
  });

  it('renders star ratings', () => {
    render(<TestimonialsSection />);
    const stars = screen.getAllByText('★');
    expect(stars.length).toBeGreaterThan(0);
  });

  it('renders role badges', () => {
    render(<TestimonialsSection />);
    expect(screen.getByText('حسابدار')).toBeDefined();
    expect(screen.getByText('فریلنسر')).toBeDefined();
  });
});
