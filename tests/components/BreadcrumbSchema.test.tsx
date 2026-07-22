import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';

describe('BreadcrumbSchema', () => {
  it('renders valid JSON-LD', () => {
    const { container } = render(
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: '/' },
          { name: 'ابزارها', url: '/tools' },
          { name: 'محاسبه وام', url: '/tools/loan' },
        ]}
      />,
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeDefined();
    const data = JSON.parse(String(script?.textContent));
    expect(data['@type']).toBe('BreadcrumbList');
    expect(data.itemListElement).toHaveLength(3);
  });

  it('renders correct positions', () => {
    const { container } = render(
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: '/' },
          { name: 'ابزارها', url: '/tools' },
        ]}
      />,
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(String(script?.textContent));
    expect(data.itemListElement[0].position).toBe(1);
    expect(data.itemListElement[1].position).toBe(2);
  });

  it('renders nothing when items is empty', () => {
    const { container } = render(<BreadcrumbSchema items={[]} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeNull();
  });
});
