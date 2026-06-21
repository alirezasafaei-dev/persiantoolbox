import { describe, expect, it } from 'vitest';

describe('JSON Formatter', () => {
  it('formats valid JSON', () => {
    const input = '{"a":1,"b":"test"}';
    const parsed = JSON.parse(input);
    const formatted = JSON.stringify(parsed, null, 2);
    expect(formatted).toContain('"a": 1');
    expect(formatted).toContain('"b": "test"');
  });

  it('minifies JSON', () => {
    const input = '{ "a": 1, "b": "test" }';
    const parsed = JSON.parse(input);
    const minified = JSON.stringify(parsed);
    expect(minified).toBe('{"a":1,"b":"test"}');
  });

  it('handles nested objects', () => {
    const input = '{"a":{"b":{"c":1}}}';
    const parsed = JSON.parse(input);
    expect(parsed.a.b.c).toBe(1);
  });

  it('handles arrays', () => {
    const input = '[1,2,3]';
    const parsed = JSON.parse(input);
    expect(parsed).toEqual([1, 2, 3]);
  });
});

describe('Hash Generator', () => {
  it('SHA-256 produces correct hash', async () => {
    const encoder = new TextEncoder();
    const data = encoder.encode('hello');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    expect(hash).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  });

  it('SHA-512 produces correct length', async () => {
    const encoder = new TextEncoder();
    const data = encoder.encode('test');
    const hashBuffer = await crypto.subtle.digest('SHA-512', data);
    const hash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    expect(hash.length).toBe(128);
  });
});

describe('Base64 Tool', () => {
  it('encodes text to Base64', () => {
    const text = 'سلام دنیا';
    const encoded = btoa(unescape(encodeURIComponent(text)));
    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(0);
  });

  it('decodes Base64 to text', () => {
    const text = 'hello';
    const encoded = btoa(text);
    const decoded = decodeURIComponent(escape(atob(encoded)));
    expect(decoded).toBe(text);
  });

  it('handles empty string', () => {
    const encoded = btoa('');
    expect(encoded).toBe('');
  });
});
