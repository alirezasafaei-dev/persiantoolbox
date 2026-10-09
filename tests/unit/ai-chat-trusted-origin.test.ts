import { describe, expect, it } from 'vitest';
import { isAllowedAiChatOrigin } from '@/lib/ai/origin';

describe('AI chat origin protection behind production reverse proxy', () => {
  const internalRequest = 'http://127.0.0.1:3004/api/ai/chat';

  it('permits canonical HTTPS Origin regardless of internal upstream Request URL', () => {
    expect(isAllowedAiChatOrigin('https://persiantoolbox.ir', internalRequest, true)).toBe(true);
    expect(
      isAllowedAiChatOrigin(
        'https://persiantoolbox.ir:443',
        'http://localhost:3000/api/ai/chat',
        true,
      ),
    ).toBe(true);
  });

  it.each([
    'http://persiantoolbox.ir',
    'https://www.persiantoolbox.ir',
    'https://persiantoolbox.ir.evil.example',
    'https://evil.example',
    'null',
    'file:///tmp/index.html',
    'not-a-url',
    'https://persiantoolbox.ir:8443',
  ])('rejects untrusted production Origin: %s', (origin) => {
    expect(isAllowedAiChatOrigin(origin, internalRequest, true)).toBe(false);
  });

  it('keeps development origin checking relative to its local request URL', () => {
    const requestUrl = 'http://localhost:3000/api/ai/chat';
    expect(isAllowedAiChatOrigin('http://localhost:3000', requestUrl, false)).toBe(true);
    expect(isAllowedAiChatOrigin('http://localhost:3004', requestUrl, false)).toBe(false);
    expect(isAllowedAiChatOrigin('https://persiantoolbox.ir', requestUrl, false)).toBe(false);
  });
});
