"use client";

import { useCallback, useEffect, useState } from "react";

// Tiny in-memory GET cache: reopening a section within 30s is instant,
// and any mutation (POST/PATCH/DELETE) busts it so data never goes stale.
const cache = new Map<string, { at: number; data: any }>();
const CACHE_TTL = 30 * 1000;

export function bustCache(prefix?: string) {
  if (!prefix) {
    cache.clear();
    return;
  }
  const drop: string[] = [];
  cache.forEach((_v, k) => { if (k.startsWith(prefix)) drop.push(k); });
  for (const k of drop) cache.delete(k);
}

export async function api(path: string, options?: RequestInit) {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try { msg = (await res.json()).error || msg; } catch {}
    throw new Error(msg);
  }
  const method = (options?.method || "GET").toUpperCase();
  if (method !== "GET") bustCache();
  return res.json();
}

export function useFetch<T = any>(path: string | null, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(null);
    try {
      const d = await api(path);
      cache.set(path, { at: Date.now(), data: d });
      setData(d);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  useEffect(() => {
    if (!path) return;
    const hit = cache.get(path);
    if (hit && Date.now() - hit.at < CACHE_TTL) {
      setData(hit.data);
      setLoading(false);
      setError(null);
      return;
    }
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload, ...deps]);
  return { data, loading, error, reload, setData };
}

export function useStats() {
  const offset = new Date().getTimezoneOffset(); // minutes behind UTC
  return useFetch(`/api/stats?offset=${-offset}`, []);
}

// Optimistic mutation helper
export async function optimistic<T>(
  apply: () => void,
  rollback: () => void,
  request: () => Promise<T>
): Promise<T | null> {
  apply();
  try {
    return await request();
  } catch (e) {
    rollback();
    throw e;
  }
}
