/** Shared modality contract: chat ships first; image is a later, separate capability. */
export type AiModality = 'chat' | 'image';
export type ChatRole = 'user' | 'assistant';
export type ChatTurn = { role: ChatRole; content: string };
export type ChatReply = { text: string; provider: 'cloudflare'; model: string };

export interface OnlineAiProvider {
  readonly id: string;
  readonly modalities: readonly AiModality[];
  completeChat(messages: ChatTurn[], signal: AbortSignal): Promise<ChatReply>;
  // Image adapters implement a separate method in a later, reviewed PR.
}

export class AiProviderError extends Error {
  constructor(public readonly code: 'throttled' | 'unavailable' | 'invalid_response', message: string) {
    super(message);
    this.name = 'AiProviderError';
  }
}

export function parseChatTurns(value: unknown): ChatTurn[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 9) return null;
  const turns: ChatTurn[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') return null;
    const role = (entry as Record<string, unknown>)['role'];
    const content = (entry as Record<string, unknown>)['content'];
    if (role !== 'user' && role !== 'assistant') return null;
    if (typeof content !== 'string' || content.trim().length < 1) return null;
    if (content.length > (role === 'user' ? 1800 : 2600)) return null;
    if (turns.length > 0 && turns[turns.length - 1]?.role === role) return null;
    if (turns.length === 0 && role !== 'user') return null;
    turns.push({ role, content: content.trim() });
  }
  return turns[turns.length - 1]?.role === 'user' ? turns : null;
}
