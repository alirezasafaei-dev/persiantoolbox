import { describe, expect, it } from 'vitest';
import { generateSoftwareApplicationSchema } from '@/lib/seo';

describe('SEO structured data cleanup', () => {
  it('does not include aggregateRating in SoftwareApplication schema', () => {
    const schema = generateSoftwareApplicationSchema(
      'Test Tool',
      'Test description',
      'https://example.com/tool',
    );

    expect(schema).toBeDefined();
    expect(schema['@type']).toBe('SoftwareApplication');
    expect('aggregateRating' in schema).toBe(false);
  });

  it('includes required SoftwareApplication fields', () => {
    const schema = generateSoftwareApplicationSchema(
      'Test Tool',
      'Test description',
      'https://example.com/tool',
    );

    expect(schema.name).toBe('Test Tool');
    expect(schema.description).toBe('Test description');
    expect(schema.url).toBe('https://example.com/tool');
    expect(schema.applicationCategory).toBe('UtilitiesApplication');
    expect(schema.operatingSystem).toBe('Web');
  });

  it('includes pricing information but no ratings', () => {
    const schema = generateSoftwareApplicationSchema(
      'Test Tool',
      'Test description',
      'https://example.com/tool',
    );

    expect(schema.offers).toBeDefined();
    expect(schema.offers['@type']).toBe('Offer');
    expect(schema.offers.price).toBe('0');
    expect(schema.offers.priceCurrency).toBe('IRR');
    expect('aggregateRating' in schema).toBe(false);
  });
});
