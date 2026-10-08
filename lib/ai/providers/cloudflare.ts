import {
  AiProviderError,
  type ChatReply,
  type ChatTurn,
  type OnlineChatProvider,
} from '@/lib/ai/contracts';

// Fixed model. Never accept a model id or endpoint from the browser and never fall back.
export const CLOUDFLARE_CHAT_MODEL = '@cf/zai-org/glm-4.7-flash';

type CloudflareEnvelope = {
  success?: boolean;
  result?: {
    response?: unknown;
    choices?: Array<{ message?: { content?: unknown } }>;
  };
};

export function extractCloudflareAnswer(data: CloudflareEnvelope): string | null {
  if (!data.success || !data.result) {
    return null;
  }
  const r = data.result;
  const text = typeof r.response === 'string' ? r.response : r.choices?.[0]?.message?.content;
  if (typeof text !== 'string') {
    return null;
  }
  const trimmed = text.trim();
  return trimmed.length > 0 && trimmed.length <= 20_000 ? trimmed : null;
}

export function createCloudflareChatProvider(): OnlineChatProvider {
  const accountId = process.env['AI_CLOUDFLARE_ACCOUNT_ID']?.trim();
  const token = process.env['AI_CLOUDFLARE_TOKEN']?.trim();
  const model = CLOUDFLARE_CHAT_MODEL;

  if (!accountId || !/^[a-f0-9]{32}$/i.test(accountId) || !token) {
    throw new AiProviderError('unavailable', 'Cloudflare AI is not configured');
  }
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;

  return {
    id: 'cloudflare',
    modalities: ['chat'],
    async completeChat(messages: ChatTurn[], signal: AbortSignal): Promise<ChatReply> {
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content:
                  'تو دستیار فارسی جعبه ابزار فارسی هستی. دقیق، روان، روشن و محترمانه پاسخ بده. اگر چیزی را نمی‌دانی حدس نزن. پاسخ را به فارسی بده مگر کاربر زبان دیگری بخواهد.',
              },
              ...messages,
            ],
            max_completion_tokens: 400,
            temperature: 0.6,
            stream: false,
            chat_template_kwargs: { enable_thinking: false },
            options: { rejectIfBusy: true },
          }),
          signal,
          cache: 'no-store',
        });
      } catch {
        throw new AiProviderError('unavailable', 'Upstream request failed');
      }

      // No silent retries, paid fallbacks or automatic model switches.
      if (response.status === 429) {
        throw new AiProviderError('throttled', 'Free inference capacity exhausted');
      }
      if (!response.ok) {
        throw new AiProviderError('unavailable', 'Cloudflare AI rejected request');
      }
      let payload: CloudflareEnvelope;
      try {
        payload = (await response.json()) as CloudflareEnvelope;
      } catch {
        throw new AiProviderError('invalid_response', 'Cloudflare sent invalid JSON');
      }
      const text = extractCloudflareAnswer(payload);
      if (!text) {
        throw new AiProviderError('invalid_response', 'Cloudflare returned no text');
      }
      return { text, provider: 'cloudflare', model };
    },
  };
}
