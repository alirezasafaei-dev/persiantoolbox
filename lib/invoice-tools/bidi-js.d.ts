declare module 'bidi-js' {
  type Embedding = { levels: Uint8Array };
  export default function bidiFactory(): {
    getEmbeddingLevels(text: string, direction: 'rtl' | 'ltr'): Embedding;
    getReorderedIndices(text: string, embedding: Embedding): number[];
    getMirroredCharacter(character: string): string | null;
    getBidiCharTypeName(character: string): string;
  };
}
