import { describe, expect, it } from 'vitest';
import { boundedChatHistory } from '@/lib/ai/chat-history';
import { parseChatTurns, type ChatTurn } from '@/lib/ai/contracts';

describe('boundedChatHistory', () => {
  it('preserves the latest user question and limits older turns', () => {
    const turns = Array.from(
      { length: 10 },
      (_, i): ChatTurn => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: 'پاسخ'.repeat(2000),
      }),
    );
    const current = { role: 'user' as const, content: 'سلام'.repeat(400) };
    const bounded = boundedChatHistory(turns, current);
    expect(bounded).toHaveLength(5);
    expect(bounded.map((x) => x.role)).toEqual(['user', 'assistant', 'user', 'assistant', 'user']);
    expect(bounded[0]?.content.length).toBe(400);
    expect(bounded[4]?.content).toBe(current.content);
    expect(parseChatTurns(bounded)).not.toBeNull();
    expect(Buffer.byteLength(JSON.stringify({ messages: bounded }), 'utf8')).toBeLessThan(16000);
  });

  it('does not exceed the raw API byte cap for maximum-length emoji input', () => {
    const turns = Array.from(
      { length: 8 },
      (_, i): ChatTurn => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: '🔥'.repeat(1200),
      }),
    );
    const bounded = boundedChatHistory(turns, {
      role: 'user',
      content: '🔥'.repeat(900),
    });
    expect(parseChatTurns(bounded)).not.toBeNull();
    expect(Buffer.byteLength(JSON.stringify({ messages: bounded }), 'utf8')).toBeLessThan(16000);
  });
});
