#!/usr/bin/env node
import { createHash, randomUUID } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';

type Message = { role: 'system' | 'user' | 'assistant'; content: string };

type Provider = {
  id: string;
  displayName: string;
  apiKeyEnv: string;
  endpoint: string;
  modelEnv: string;
  defaultModel: string;
  headers: (apiKey: string) => Record<string, string>;
  requestPayload: (
    messages: Message[],
    maxTokens: number,
    temperature: number,
  ) => Record<string, unknown>;
  extractText: (json: unknown) => string | undefined;
};

type ProviderResponse = {
  provider: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  latencyMs: number;
  text: string;
};

type UsageEstimate = {
  inputTokens: number;
  outputTokens: number;
};

type CliArgs = {
  prompt: string;
  providerOrder: string[];
  maxTokens: number;
  temperature: number;
  timeoutMs: number;
  systemPrompt: string;
  cacheFile: string;
  disableCache: boolean;
  json: boolean;
  extraPrompt: string;
};

const PROVIDERS: Provider[] = [
  {
    id: 'openai',
    displayName: 'ChatGPT',
    apiKeyEnv: 'OPENAI_API_KEY',
    endpoint: `${process.env['OPENAI_API_BASE_URL'] ?? 'https://api.openai.com'}/v1/chat/completions`,
    modelEnv: 'OPENAI_MODEL',
    defaultModel: 'gpt-4o-mini',
    headers: (apiKey) => ({
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }),
    requestPayload: (messages, maxTokens, temperature) => ({
      model: process.env['OPENAI_MODEL'] ?? 'gpt-4o-mini',
      messages,
      max_tokens: maxTokens,
      temperature,
      stream: false,
    }),
    extractText: (json) => {
      const raw = json as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      return raw?.choices?.[0]?.message?.content;
    },
  },
  {
    id: 'deepseek',
    displayName: 'DeepSeek',
    apiKeyEnv: 'DEEPSEEK_API_KEY',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    modelEnv: 'DEEPSEEK_MODEL',
    defaultModel: 'deepseek-chat',
    headers: (apiKey) => ({
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }),
    requestPayload: (messages, maxTokens, temperature) => ({
      model: process.env['DEEPSEEK_MODEL'] ?? 'deepseek-chat',
      messages,
      max_tokens: maxTokens,
      temperature,
      stream: false,
    }),
    extractText: (json) => {
      const raw = json as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      return raw?.choices?.[0]?.message?.content;
    },
  },
  {
    id: 'openrouter',
    displayName: 'OpenRouter',
    apiKeyEnv: 'OPENROUTER_API_KEY',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    modelEnv: 'OPENROUTER_MODEL',
    defaultModel: 'google/gemma-2-9b-it:free',
    headers: (apiKey) => ({
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env['SITE_URL'] ?? '',
      'X-Title': process.env['SITE_NAME'] ?? 'Persian Toolbox',
    }),
    requestPayload: (messages, maxTokens, temperature) => ({
      model: process.env['OPENROUTER_MODEL'] ?? 'google/gemma-2-9b-it:free',
      messages,
      max_tokens: maxTokens,
      temperature,
      stream: false,
    }),
    extractText: (json) => {
      const raw = json as {
        choices?: Array<{ message?: { content?: string }; text?: string }>;
      };
      return raw?.choices?.[0]?.message?.content ?? raw?.choices?.[0]?.text;
    },
  },
];

const defaultSystemPrompt =
  'کمک‌کننده فنی پروژه‌هام: پاسخ‌ها را کوتاه، دقیق، و قابل اجرا بده. فقط اطلاعات لازم را نگهدار و از تکرار بی‌مورد پرهیز کن.';

function usage() {
  console.log(
    [
      'Usage:',
      '  pnpm ai:ask "متن سوال"',
      '  echo "متن سوال" | pnpm ai:ask',
      '',
      'Options:',
      '  --providers=openai,deepseek,openrouter    ترتیب تلاش providerها',
      '  --max-tokens=800                   سقف خروجی',
      '  --temp=0.2                         دما',
      '  --timeout-ms=10000                 تایم‌اوت درخواست',
      '  --system="..."                      پیام سیستمی',
      '  --cache-file=.cache/ai-cache.jsonl  مسیر کش',
      '  --no-cache                          غیرفعال‌کردن کش',
      '  --json                             خروجی JSON',
    ].join('\n'),
  );
}

function parseArgs(argv: string[]): CliArgs {
  let prompt = '';
  let providerOrder = ['openai', 'deepseek', 'openrouter'];
  let maxTokens = 1200;
  let temperature = 0.2;
  let timeoutMs = 10000;
  let systemPrompt = defaultSystemPrompt;
  let cacheFile = '.cache/ai-cache.jsonl';
  let disableCache = false;
  let json = false;
  let extraPrompt = '';

  for (const arg of argv) {
    if (arg.startsWith('--providers=')) {
      const list = arg
        .replace('--providers=', '')
        .split(',')
        .map((p) => p.trim().toLowerCase());
      providerOrder = list.filter(Boolean);
      continue;
    }
    if (arg.startsWith('--max-tokens=')) {
      maxTokens = Number(arg.replace('--max-tokens=', ''));
      continue;
    }
    if (arg.startsWith('--temp=')) {
      temperature = Number(arg.replace('--temp=', ''));
      continue;
    }
    if (arg.startsWith('--timeout-ms=')) {
      timeoutMs = Number(arg.replace('--timeout-ms=', ''));
      continue;
    }
    if (arg.startsWith('--system=')) {
      systemPrompt = arg.replace('--system=', '');
      continue;
    }
    if (arg.startsWith('--cache-file=')) {
      cacheFile = arg.replace('--cache-file=', '');
      continue;
    }
    if (arg === '--no-cache') {
      disableCache = true;
      continue;
    }
    if (arg === '--json') {
      json = true;
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      usage();
      process.exit(0);
    }
    if (arg.startsWith('--')) {
      continue;
    }

    if (!prompt) {
      prompt = arg;
      continue;
    }
    extraPrompt = extraPrompt ? `${extraPrompt}\n${arg}` : arg;
  }

  if (!prompt && extraPrompt) {
    prompt = extraPrompt;
  } else if (prompt && extraPrompt) {
    prompt = `${prompt}\n${extraPrompt}`;
  }

  const finalPrompt = prompt.trim();
  if (maxTokens <= 0 || !Number.isFinite(maxTokens)) {
    throw new Error('max-tokens باید عدد مثبت باشد');
  }
  if (temperature < 0 || temperature > 2 || !Number.isFinite(temperature)) {
    throw new Error('temp باید بین 0 تا 2 باشد');
  }

  return {
    prompt: finalPrompt,
    providerOrder,
    maxTokens,
    temperature,
    timeoutMs,
    systemPrompt,
    cacheFile,
    disableCache,
    json,
    extraPrompt,
  };
}

function getProviderById(id: string): Provider | undefined {
  const normalized = id.toLowerCase();
  return PROVIDERS.find((p) => p.id === normalized);
}

function getUsageEstimate(json: unknown): UsageEstimate | undefined {
  const raw = json as { usage?: { prompt_tokens?: number; completion_tokens?: number } };
  const promptTokens = raw?.usage?.prompt_tokens;
  const completionTokens = raw?.usage?.completion_tokens;
  if (
    !Number.isFinite(promptTokens ?? Number.NaN) ||
    !Number.isFinite(completionTokens ?? Number.NaN)
  ) {
    return undefined;
  }
  return {
    inputTokens: promptTokens ?? 0,
    outputTokens: completionTokens ?? 0,
  };
}

function estimateCost(provider: string, usage: UsageEstimate | undefined): number | undefined {
  if (!usage) {
    return undefined;
  }
  const prefix = provider.toUpperCase().replace('-', '_');
  const inRate = Number(process.env[`${prefix}_INPUT_PRICE_PER_1M`] ?? '0');
  const outRate = Number(process.env[`${prefix}_OUTPUT_PRICE_PER_1M`] ?? '0');
  if (!Number.isFinite(inRate) || !Number.isFinite(outRate)) {
    return undefined;
  }
  const usd = (usage.inputTokens / 1_000_000) * inRate + (usage.outputTokens / 1_000_000) * outRate;
  return Number(usd.toFixed(6));
}

async function callProvider(
  provider: Provider,
  messages: Message[],
  maxTokens: number,
  temperature: number,
  timeoutMs: number,
): Promise<ProviderResponse> {
  const apiKey = process.env[provider.apiKeyEnv];
  if (!apiKey) {
    throw new Error(`${provider.apiKeyEnv} تعریف نشده`);
  }

  const startedAt = Date.now();
  const model = process.env[provider.modelEnv] ?? provider.defaultModel;
  const payload = provider.requestPayload(messages, maxTokens, temperature);
  const headers = provider.headers(apiKey);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resp = await fetch(provider.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const data = await resp.json();
    if (!resp.ok) {
      const errorMessage = typeof data?.error === 'string' ? data.error : JSON.stringify(data);
      throw new Error(`${provider.displayName} - HTTP ${resp.status}: ${errorMessage}`);
    }

    const text = provider.extractText(data);
    if (!text) {
      throw new Error(`${provider.displayName} پاسخ متنی نداد`);
    }

    const usage = getUsageEstimate(data);
    return {
      provider: provider.displayName,
      model,
      latencyMs: Date.now() - startedAt,
      text: text.trim(),
      inputTokens: usage?.inputTokens,
      outputTokens: usage?.outputTokens,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function makeCacheKey(opts: {
  providerOrder: string[];
  prompt: string;
  systemPrompt: string;
  maxTokens: number;
  temperature: number;
}): string {
  const raw = JSON.stringify(opts);
  return createHash('sha256').update(raw).digest('hex');
}

function readCache(cacheFile: string, key: string): string | undefined {
  if (!existsSync(cacheFile)) {
    return undefined;
  }
  const lines = readFileSync(cacheFile, 'utf8').split('\n').filter(Boolean);
  for (const line of lines.reverse()) {
    try {
      const parsed = JSON.parse(line) as { key: string; value: string };
      if (parsed.key === key) {
        return parsed.value;
      }
    } catch {
      continue;
    }
  }
  return undefined;
}

function writeCache(cacheFile: string, key: string, value: string) {
  const dir = dirname(cacheFile);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const record = JSON.stringify({
    key,
    value,
    createdAt: new Date().toISOString(),
    id: randomUUID(),
  });
  appendFileSync(cacheFile, `${record}\n`, 'utf8');
}

async function run(args: CliArgs) {
  const key = makeCacheKey({
    providerOrder: args.providerOrder,
    prompt: args.prompt,
    systemPrompt: args.systemPrompt,
    maxTokens: args.maxTokens,
    temperature: args.temperature,
  });
  const cacheValue = args.disableCache ? undefined : readCache(args.cacheFile, key);
  if (cacheValue) {
    const cached = JSON.parse(cacheValue) as ProviderResponse;
    if (args.json) {
      console.log(JSON.stringify({ ...cached, fromCache: true }, null, 2));
    } else {
      // eslint-disable-next-line no-console
      console.log(`[cache] ${cached.provider}`);
      console.log(cached.text);
    }
    return;
  }

  const messages: Message[] = [
    { role: 'system', content: args.systemPrompt },
    { role: 'user', content: args.prompt },
  ];

  let lastError: Error | null = null;
  for (const providerId of args.providerOrder) {
    const provider = getProviderById(providerId);
    if (!provider) {
      // eslint-disable-next-line no-console
      console.error(`[skip] Provider ${providerId} پیکربندی نشده`);
      continue;
    }
    try {
      const response = await callProvider(
        provider,
        messages,
        args.maxTokens,
        args.temperature,
        args.timeoutMs,
      );
      const output: ProviderResponse & { costUsd?: number } = {
        ...response,
        costUsd: estimateCost(provider.id, {
          inputTokens: response.inputTokens ?? 0,
          outputTokens: response.outputTokens ?? 0,
        }),
      };

      writeCache(args.cacheFile, key, JSON.stringify(output));

      if (args.json) {
        console.log(JSON.stringify(output, null, 2));
      } else {
        // eslint-disable-next-line no-console
        console.log(`[${response.provider}] ${response.model} | ${response.latencyMs}ms`);
        if (response.inputTokens !== undefined && response.outputTokens !== undefined) {
          // eslint-disable-next-line no-console
          console.log(
            `input=${response.inputTokens} output=${response.outputTokens} token${
              response.inputTokens + response.outputTokens > 1 ? 's' : ''
            }`,
          );
        }
        if (output.costUsd !== undefined) {
          // eslint-disable-next-line no-console
          console.log(`~$${output.costUsd} (est.)`);
        }
        console.log('---');
        console.log(response.text);
      }
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      // eslint-disable-next-line no-console
      console.error(`[fallback] ${provider.displayName} fail: ${lastError.message}`);
    }
  }

  const message = lastError ? lastError.message : 'همه providerها ناموفق بود';
  if (!args.json) {
    // eslint-disable-next-line no-console
    console.error(message);
  }
  throw new Error(message);
}

async function getPromptFromStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  return new Promise<string>((resolve) => {
    process.stdin.on('data', (chunk: Buffer) => {
      chunks.push(Buffer.from(chunk));
    });
    process.stdin.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8').trim());
    });
  });
}

const cli = parseArgs(process.argv.slice(2));

(async () => {
  const finalPrompt = cli.prompt.length > 0 ? cli.prompt : await getPromptFromStdin();
  if (!finalPrompt) {
    usage();
    process.exitCode = 1;
    return;
  }
  if (finalPrompt !== cli.prompt) {
    const fallback = {
      ...cli,
      prompt: finalPrompt,
    };
    await run(fallback);
    return;
  }
  await run(cli);
})().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
