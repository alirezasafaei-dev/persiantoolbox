export type HistoryEntry = {
  id: string;
  tool: string;
  inputSummary: string;
  outputSummary: string;
  outputUrl?: string | undefined;
  createdAt: number;
};
