import { describe, expect, it } from 'vitest';
import { buildOpenApiDocument, developerApiProducts } from '@/lib/developer-api-catalog';

describe('developer API catalog', () => {
  it('uses unique endpoint and documentation paths', () => {
    const endpoints = developerApiProducts.map((product) => product.endpoint);
    const docsPaths = developerApiProducts.map((product) => product.docsPath);

    expect(new Set(endpoints).size).toBe(endpoints.length);
    expect(new Set(docsPaths).size).toBe(docsPaths.length);
    docsPaths.forEach((path) => expect(path).toMatch(/^\/developers\/api\//));
  });

  it('publishes the promoted endpoints in OpenAPI 3.1', () => {
    const document = buildOpenApiDocument('https://persiantoolbox.ir');

    expect(document.openapi).toBe('3.1.0');
    expect(document.info.version).toBe('8.0.0');
    expect(document.servers[0]?.url).toBe('https://persiantoolbox.ir');
    expect(document.paths).toHaveProperty('/api/market');
    expect(document.paths).toHaveProperty('/api/data/salary-laws');
    expect(document.paths).toHaveProperty('/api/health');
    expect(document.paths).toHaveProperty('/api/ready');
    expect(document.paths).toHaveProperty('/api/version');
  });

  it('documents freshness, units and conditional caching signals', () => {
    const document = buildOpenApiDocument('https://persiantoolbox.ir');
    const marketSchema = document.components.schemas.MarketResponse;
    const salaryOperation = document.paths['/api/data/salary-laws'].get;

    expect(JSON.stringify(marketSchema)).toContain('freshness');
    expect(JSON.stringify(marketSchema)).toContain('sources');
    expect(JSON.stringify(marketSchema)).toContain('units');
    expect(JSON.stringify(marketSchema)).toContain('goldPricePerGram');
    expect(JSON.stringify(salaryOperation)).toContain('If-None-Match');
    expect(JSON.stringify(salaryOperation)).toContain('304');
  });

  it('documents degraded health and readiness responses', () => {
    const document = buildOpenApiDocument('https://persiantoolbox.ir');

    expect(document.paths['/api/health'].get.responses).toHaveProperty('503');
    expect(document.paths['/api/ready'].get.responses).toHaveProperty('503');
  });
});
