import type { ChatTurn } from '@/lib/ai/contracts';

/**
 * Keep only two preceding exchanges plus the current message.
 * Trim older turns to 400 UTF-16 code units each. The current user turn
 * retains the full API-accepted 1,800 characters. Even worst-case UTF-8
 * content stays below the API's 16 KB raw-body guard.
 */
export function boundedChatHistory(previous: ChatTurn[], current: ChatTurn): ChatTurn[] {
  const turns = [...previous, current].slice(-5);
  return turns.map((turn, index) => ({
    role: turn.role,
    content: index === turns.length - 1 ? turn.content : turn.content.slice(0, 400),
  }));
}
