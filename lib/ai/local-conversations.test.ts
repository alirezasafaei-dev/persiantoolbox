import { describe, expect, it } from 'vitest';
import { parseLocalConversations, createConversation } from './local-conversations';

describe('local conversations', () => {
  it('restores only explicitly opted-in validated data', () => {
    const conversation = createConversation();
    const snapshot = {
      version: 1,
      consent: true,
      activeId: conversation.id,
      conversations: [conversation],
    };
    expect(parseLocalConversations(JSON.stringify(snapshot))?.conversations).toEqual([
      conversation,
    ]);
    expect(parseLocalConversations(JSON.stringify({ ...snapshot, consent: false }))).toBeNull();
    expect(parseLocalConversations('{')).toBeNull();
    expect(parseLocalConversations('x'.repeat(1_000_001))).toBeNull();
  });
  it('rejects malformed turns, duplicate ids and unbounded data', () => {
    const c = createConversation();
    const serialize = (conversations: unknown[]) =>
      JSON.stringify({ version: 1, consent: true, activeId: c.id, conversations });
    expect(parseLocalConversations(serialize([c, c]))).toBeNull();
    expect(parseLocalConversations(serialize([{ ...c, draft: 'x'.repeat(1801) }]))).toBeNull();
    expect(
      parseLocalConversations(serialize([{ ...c, turns: [{ role: 'system', content: 'x' }] }])),
    ).toBeNull();
    expect(
      parseLocalConversations(serialize([{ ...c, turns: [{ role: 'assistant', content: 'x' }] }])),
    ).toBeNull();
  });
});
