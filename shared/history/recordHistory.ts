export type HistoryPayload = {
  tool: string;
  inputSummary: string;
  outputSummary: string;
  outputUrl?: string;
};

export function normalizeHistoryOutputUrl(input?: string | null): string | undefined {
  if (!input) {
    return undefined;
  }
  const trimmed = input.trim();
  if (!trimmed.length) {
    return undefined;
  }
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return undefined;
  }
  return trimmed;
}

type HistoryQueryInput = {
  search?: string;
  tool?: string;
  dateRange?: string;
};

export function buildHistoryQuery(filters?: HistoryQueryInput, defaultLimit = 50): string {
  const url = new URL('http://localhost');
  url.searchParams.set('limit', defaultLimit.toString());
  if (filters?.search?.trim()) {
    url.searchParams.set('search', filters.search);
  }
  if (filters?.tool?.trim()) {
    url.searchParams.set('tool', filters.tool);
  }
  if (filters?.dateRange) {
    url.searchParams.set('dateRange', filters.dateRange);
  }
  return url.search;
}

export async function recordHistory(payload: HistoryPayload): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }
  const hasSession = document.cookie.split(';').some((item) => item.trim().startsWith('pt_session='));
  if (!hasSession) {
    return;
  }
  try {
    await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // silent fail to avoid impacting UX
  }
}
