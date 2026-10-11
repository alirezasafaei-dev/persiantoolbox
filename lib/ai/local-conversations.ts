import type { ChatTurn } from './contracts';

export const LOCAL_CHAT_STORAGE = 'pt-ai-conversations-v1';
export const MAX_CONVERSATIONS = 20;
export const MAX_LOCAL_TURNS = 100;
export type LocalConversation = { id: string; title: string; draft: string; turns: ChatTurn[] };
export type LocalSnapshot = {
  version: 1;
  consent: true;
  activeId: string;
  conversations: LocalConversation[];
};

export function createConversation(): LocalConversation {
  return { id: crypto.randomUUID(), title: 'گفت‌وگوی تازه', draft: '', turns: [] };
}

/** Treat browser storage as untrusted, bounded data; never migrate old implicit consent. */
export function parseLocalConversations(raw: string | null): LocalSnapshot | null {
  if (!raw || raw.length > 1_000_000) {
    return null;
  }
  try {
    const value = JSON.parse(raw) as LocalSnapshot;
    if (
      value?.version !== 1 ||
      value.consent !== true ||
      !Array.isArray(value.conversations) ||
      value.conversations.length < 1 ||
      value.conversations.length > MAX_CONVERSATIONS
    ) {
      return null;
    }
    const ids = new Set<string>();
    for (const c of value.conversations) {
      if (
        !c ||
        typeof c.id !== 'string' ||
        !/^[a-zA-Z0-9-]{1,80}$/.test(c.id) ||
        ids.has(c.id) ||
        typeof c.title !== 'string' ||
        c.title.length < 1 ||
        c.title.length > 80 ||
        typeof c.draft !== 'string' ||
        c.draft.length > 1800 ||
        !Array.isArray(c.turns) ||
        c.turns.length > MAX_LOCAL_TURNS
      ) {
        return null;
      }
      ids.add(c.id);
      for (let i = 0; i < c.turns.length; i++) {
        const turn = c.turns[i];
        if (
          !turn ||
          turn.role !== (i % 2 === 0 ? 'user' : 'assistant') ||
          typeof turn.content !== 'string' ||
          !turn.content.trim() ||
          turn.content.length > (turn.role === 'user' ? 1800 : 20_000)
        ) {
          return null;
        }
      }
      // Persist only completed exchanges; a pending turn is kept in memory.
      if (c.turns.length % 2 !== 0) {
        return null;
      }
    }
    return ids.has(value.activeId) ? value : null;
  } catch {
    return null;
  }
}
