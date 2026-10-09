import { expect, test } from '@playwright/test';

test('serves homepage identity and page schema before JavaScript runs', async ({ request }) => {
  const response = await request.get('/');
  expect(response.status()).toBe(200);
  const csp = response.headers()['content-security-policy'] ?? '';
  const nonce = csp.match(/'nonce-([^']+)'/)?.[1];
  expect(nonce).toBeTruthy();
  const html = await response.text();
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter((match) => /\btype="application\/ld\+json"/.test(match[1] ?? ''))
    .map((match) => ({ attributes: match[1] ?? '', data: JSON.parse(match[2] ?? '{}') }));

  for (const id of ['root-structured-data', 'home-json-ld']) {
    const matching = scripts.filter((script) => script.attributes.includes(`id="${id}"`));
    expect(matching, `${id} must appear once in the HTTP response`).toHaveLength(1);
    expect(matching[0]?.data['@context']).toBe('https://schema.org');
    expect(matching[0]?.attributes).toContain(`nonce="${nonce}"`);
  }
  expect(JSON.stringify(scripts)).toContain('github.com/alirezasafaei-dev/persiantoolbox');
});

test('serves one address-tool heading independently of its interactive component', async ({
  request,
}) => {
  const response = await request.get('/text-tools/address-fa-to-en');
  expect(response.status()).toBe(200);
  const html = await response.text();
  const headings = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  expect(headings).toHaveLength(1);
  expect(headings[0]?.[1]).toBe('تبدیل آدرس فارسی به انگلیسی');
});
