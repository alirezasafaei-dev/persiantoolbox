/**
 * API Key Manager - PersianToolbox
 *
 * Manages API keys for developers
 */

import {agentLogger} from '@/lib/agent-logger';

export type ApiKeyTier = 'free' | 'basic' | 'pro' | 'enterprise';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  tier: ApiKeyTier;
  userId: string;
  permissions: string[];
  rateLimit: number;
  dailyLimit: number;
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
}

const apiKeys = new Map<string, ApiKey>();
const keyUsage = new Map<string, {date: string; count: number}>();

export function generateApiKey(
  name: string,
  userId: string,
  tier: ApiKeyTier = 'free',
): ApiKey {
  const key = `ptb_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

  const apiKey: ApiKey = {
    id: `key_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name,
    key,
    tier,
    userId,
    permissions: getPermissionsForTier(tier),
    rateLimit: getRateLimitForTier(tier),
    dailyLimit: getDailyLimitForTier(tier),
    createdAt: new Date().toISOString(),
  };

  apiKeys.set(apiKey.id, apiKey);
  agentLogger.info('api-keys', 'generate', `API key generated: ${apiKey.id}`, {name, tier});

  return apiKey;
}

export function validateApiKey(key: string): ApiKey | null {
  const apiKey = Array.from(apiKeys.values()).find((k) => k.key === key);
  if (!apiKey) {
    return null;
  }

  if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
    return null;
  }

  apiKey.lastUsedAt = new Date().toISOString();
  apiKeys.set(apiKey.id, apiKey);

  return apiKey;
}

export function checkRateLimit(key: string): {allowed: boolean; remaining: number} {
  const apiKey = Array.from(apiKeys.values()).find((k) => k.key === key);
  if (!apiKey) {
    return {allowed: false, remaining: 0};
  }

  const today = new Date().toISOString().split('T')[0] ?? '';
  const usage = keyUsage.get(key);

  if (!usage || usage.date !== today) {
    keyUsage.set(key, {date: today, count: 1});
    return {allowed: true, remaining: apiKey.dailyLimit - 1};
  }

  if (usage.count >= apiKey.dailyLimit) {
    return {allowed: false, remaining: 0};
  }

  usage.count++;
  return {allowed: true, remaining: apiKey.dailyLimit - usage.count};
}

export function revokeApiKey(keyId: string): boolean {
  const deleted = apiKeys.delete(keyId);
  if (deleted) {
    agentLogger.info('api-keys', 'revoke', `API key revoked: ${keyId}`);
  }
  return deleted;
}

export function getUserApiKeys(userId: string): ApiKey[] {
  return Array.from(apiKeys.values()).filter((k) => k.userId === userId);
}

export function getApiKeyById(keyId: string): ApiKey | undefined {
  return apiKeys.get(keyId);
}

function getPermissionsForTier(tier: ApiKeyTier): string[] {
  const permissions: Record<ApiKeyTier, string[]> = {
    free: ['tools:read'],
    basic: ['tools:read', 'tools:execute'],
    pro: ['tools:read', 'tools:execute', 'tools:export', 'analytics:read'],
    enterprise: ['*'],
  };
  return permissions[tier];
}

function getRateLimitForTier(tier: ApiKeyTier): number {
  const limits: Record<ApiKeyTier, number> = {
    free: 10,
    basic: 60,
    pro: 300,
    enterprise: 1000,
  };
  return limits[tier];
}

function getDailyLimitForTier(tier: ApiKeyTier): number {
  const limits: Record<ApiKeyTier, number> = {
    free: 100,
    basic: 1000,
    pro: 10000,
    enterprise: -1,
  };
  return limits[tier];
}
