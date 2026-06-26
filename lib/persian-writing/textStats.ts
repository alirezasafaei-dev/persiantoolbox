import type { TextStats } from './types';

export function calculateStats(text: string): TextStats {
  const characters = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sentences = text.trim() ? text.split(/[.؟!]+/).filter((s) => s.trim()).length : 0;
  const paragraphs = text.trim() ? text.split(/\n\n+/).filter((p) => p.trim()).length : 0;
  const readingTimeMinutes = Math.max(1, Math.round(words / 200));
  return { characters, words, sentences, paragraphs, readingTimeMinutes };
}
