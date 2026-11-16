// Hybrid Layered Cache: In-memory (L1) + Redis (L2) with automatic fallback.
// When UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (or REDIS_URL) are set,
// cache is distributed across all Vercel serverless lambda instances.
// When Redis is not configured, it gracefully runs on high-speed in-memory LRU cache.

import { Redis } from "@upstash/redis";

type Entry = { at: number; data: any };

const store = new Map<string, Entry>();
const DEFAULT_TTL_SEC = 60; // 60s cache
const MAX_ENTRIES = 400;

let redisClient: Redis | null = null;
let redisInitialized = false;

function getRedis(): Redis | null {
  if (redisInitialized) return redisClient;
  redisInitialized = true;
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    if (url && token) {
      redisClient = new Redis({ url, token });
    }
  } catch (err) {
    console.warn("[cache] Redis initialization failed, falling back to in-memory:", err);
    redisClient = null;
  }
  return redisClient;
}

/** Synchronous L1 memory read. Used for instant latency in synchronous route handlers. */
export function cacheGet<T = any>(key: string, ttlMs: number = DEFAULT_TTL_SEC * 1000): T | null {
  const e = store.get(key);
  if (!e) return null;
  if (Date.now() - e.at > ttlMs) {
    store.delete(key);
    return null;
  }
  return e.data as T;
}

/** Async L1 + L2 read: checks memory first, then checks Redis. */
export async function cacheGetAsync<T = any>(key: string, ttlSec: number = DEFAULT_TTL_SEC): Promise<T | null> {
  const l1 = cacheGet<T>(key, ttlSec * 1000);
  if (l1 !== null) return l1;

  const redis = getRedis();
  if (!redis) return null;

  try {
    const val = await redis.get<T>(key);
    if (val !== null && val !== undefined) {
      // Warm L1 memory cache
      store.set(key, { at: Date.now(), data: val });
      return val;
    }
  } catch {}
  return null;
}

/** Set cache in L1 memory and asynchronously in Redis (if configured). */
export function cacheSet(key: string, data: any, ttlSec: number = DEFAULT_TTL_SEC) {
  // L1 In-Memory eviction guard
  if (store.size >= MAX_ENTRIES) {
    const all: { k: string; at: number }[] = [];
    store.forEach((v, k) => all.push({ k, at: v.at }));
    all.sort((a, b) => a.at - b.at);
    for (let i = 0; i < 100 && i < all.length; i++) store.delete(all[i].k);
  }
  store.set(key, { at: Date.now(), data });

  // L2 Distributed Redis
  const redis = getRedis();
  if (redis) {
    redis.set(key, JSON.stringify(data), { ex: ttlSec }).catch(() => {});
  }
}

/** Invalidate cache for a user across L1 memory and L2 Redis. */
export function bustUser(userId: number | string) {
  const prefix = `u${userId}:`;

  // Drop local memory keys
  const drop: string[] = [];
  store.forEach((_v, k) => {
    if (k.startsWith(prefix)) drop.push(k);
  });
  for (const k of drop) store.delete(k);

  // Invalidate Redis cluster keys asynchronously
  const redis = getRedis();
  if (redis) {
    redis.keys(`${prefix}*`).then((keys) => {
      if (keys && keys.length > 0) {
        redis.del(...keys).catch(() => {});
      }
    }).catch(() => {});
  }
}
