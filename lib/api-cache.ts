// Ultra-Fast Non-Blocking Layered Cache: In-memory (L1) + Background Redis (L2).
// Architecture:
// 1. In-memory (L1) lookup is synchronous and instantaneous (~0.05ms).
// 2. Redis (L2) queries have a strict 350ms timeout so a distant/sleeping Redis
//    never blocks or delays API responses.
// 3. Redis writes and invalidations run entirely in the background (fire-and-forget).
// 4. If Redis credentials are not configured or slow, L1 serves requests at maximum speed.

import { Redis } from "@upstash/redis";

type Entry = { at: number; data: any };

const store = new Map<string, Entry>();
const DEFAULT_TTL_SEC = 120; // 2 minutes
const MAX_ENTRIES = 500;

let redisClient: Redis | null = null;
let redisInitialized = false;

export function getRedis(): Redis | null {
  if (redisInitialized) return redisClient;
  redisInitialized = true;
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    if (url && token) {
      redisClient = new Redis({ url, token });
    }
  } catch (err) {
    redisClient = null;
  }
  return redisClient;
}

/** Instant synchronous L1 memory read (~0ms latency). */
export function cacheGet<T = any>(key: string, ttlMs: number = DEFAULT_TTL_SEC * 1000): T | null {
  const e = store.get(key);
  if (!e) return null;
  if (Date.now() - e.at > ttlMs) {
    store.delete(key);
    return null;
  }
  return e.data as T;
}

/**
 * Non-blocking async read:
 * 1. Checks in-memory (L1) immediately.
 * 2. If missed and Redis is configured, races Redis with a 350ms timeout.
 * 3. Never hangs or stalls the page response.
 */
export async function cacheGetAsync<T = any>(key: string, ttlSec: number = DEFAULT_TTL_SEC): Promise<T | null> {
  const l1 = cacheGet<T>(key, ttlSec * 1000);
  if (l1 !== null) return l1;

  const redis = getRedis();
  if (!redis) return null;

  try {
    // 350ms hard timeout guard against cold starts / network latency
    const redisPromise = redis.get<T>(key);
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 350));
    const val = await Promise.race([redisPromise, timeoutPromise]);

    if (val !== null && val !== undefined) {
      store.set(key, { at: Date.now(), data: val });
      return val;
    }
  } catch {}
  return null;
}

/** Set cache in L1 memory and asynchronously in Redis. */
export function cacheSet(key: string, data: any, ttlSec: number = DEFAULT_TTL_SEC) {
  // L1 In-Memory eviction guard
  if (store.size >= MAX_ENTRIES) {
    const all: { k: string; at: number }[] = [];
    store.forEach((v, k) => all.push({ k, at: v.at }));
    all.sort((a, b) => a.at - b.at);
    for (let i = 0; i < 100 && i < all.length; i++) store.delete(all[i].k);
  }
  store.set(key, { at: Date.now(), data });

  // L2 Distributed Redis (Fire-and-forget, never awaits or blocks response)
  const redis = getRedis();
  if (redis) {
    Promise.resolve().then(() => {
      redis.set(key, data, { ex: ttlSec }).catch(() => {});
    });
  }
}

/** Invalidate cache for a user across L1 memory and L2 Redis without blocking. */
export function bustUser(userId: number | string) {
  const prefix = `u${userId}:`;

  // Drop local memory keys immediately
  const drop: string[] = [];
  store.forEach((_v, k) => {
    if (k.startsWith(prefix)) drop.push(k);
  });
  for (const k of drop) store.delete(k);

  // Invalidate Redis cluster keys asynchronously in background
  const redis = getRedis();
  if (redis) {
    Promise.resolve().then(async () => {
      try {
        const keys = await redis.keys(`${prefix}*`);
        if (keys && keys.length > 0) {
          await redis.del(...keys);
        }
      } catch {}
    });
  }
}
