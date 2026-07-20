import { createClient, type RedisClientType } from 'redis';
import { logger } from './logger';

const REDIS_URL = process.env['REDIS_URL'];

let client: RedisClientType | null = null;
let connecting = false;
let connected = false;
let lastFailAt = 0;
const COOLDOWN_MS = 60_000;

function isRedisConfigured(): boolean {
  return !!REDIS_URL;
}

async function getClient(): Promise<RedisClientType | null> {
  if (!isRedisConfigured()) return null;
  if (connected && client) return client;
  if (connecting) return null;
  if (lastFailAt && Date.now() - lastFailAt < COOLDOWN_MS) return null;

  connecting = true;
  try {
    client = createClient({
      url: REDIS_URL as string,
      socket: { connectTimeout: 2000, reconnectStrategy: false },
    });
    client.on('error', (error) => {
      logger.warn('Redis connection error', { error: String(error) });
      connected = false;
    });
    client.on('connect', () => {
      connected = true;
    });
    await client.connect();
    connected = true;
    lastFailAt = 0;
    return client;
  } catch (error) {
    logger.warn('Redis unavailable, falling back to no-cache', { error: String(error) });
    connected = false;
    lastFailAt = Date.now();
    return null;
  } finally {
    connecting = false;
  }
}

export async function redisGet(key: string): Promise<string | null> {
  const current = await getClient();
  if (!current) return null;
  try {
    return await current.get(key);
  } catch {
    return null;
  }
}

export async function redisSet(key: string, value: string, ttlSeconds?: number): Promise<void> {
  const current = await getClient();
  if (!current) return;
  try {
    if (ttlSeconds && ttlSeconds > 0) {
      await current.setEx(key, ttlSeconds, value);
    } else {
      await current.set(key, value);
    }
  } catch {
    // Best-effort, never block request.
  }
}

export async function redisDel(key: string): Promise<void> {
  const current = await getClient();
  if (!current) return;
  try {
    await current.del(key);
  } catch {
    // Best-effort.
  }
}

export async function redisIncr(key: string, ttlSeconds: number): Promise<number> {
  const current = await getClient();
  if (!current) return -1;
  try {
    const value = await current.incr(key);
    if (value === 1) await current.expire(key, ttlSeconds);
    return value;
  } catch {
    return -1;
  }
}

export function redisIsAvailable(): boolean {
  return isRedisConfigured() && connected;
}

export async function redisHealthCheck(): Promise<boolean> {
  const current = await getClient();
  if (!current) return false;
  try {
    return (await current.ping()) === 'PONG';
  } catch {
    connected = false;
    return false;
  }
}
