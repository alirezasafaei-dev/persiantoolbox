import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import FaqSchema from '@/components/seo/FaqSchema';

const mockFaqs = [
  { question: 'ابزار رایگان است؟', answer: 'بله، اکثر ابزارها رایگان هستند.' },
  { question: 'آیا نیاز به ثبت‌نام است؟', answer: 'خیر، بدون ثبت‌نام قابل استفاده است.' },
];

describe('FaqSchema', () => {
  it('renders valid JSON-LD', () => {
    const { container } = render(<FaqSchema faq={mockFaqs} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeDefined();
    const data = JSON.parse(String(script?.textContent));
    expect(data['@type']).toBe('FAQPage');
    expect(data.mainEntity).toHaveLength(2);
  });

  it('renders correct question-answer pairs', () => {
    const { container } = render(<FaqSchema faq={mockFaqs} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(String(script?.textContent));
    expect(data.mainEntity[0].name).toBe('ابزار رایگان است؟');
    expect(data.mainEntity[0].acceptedAnswer.text).toBe('بله، اکثر ابزارها رایگان هستند.');
  });

  it('renders nothing when faqs is empty', () => {
    const { container } = render(<FaqSchema faq={[]} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeNull();
  });
});
