"use client";

import { useCallback, useEffect, useState } from "react";
import { enqueueOffline } from "./offline";

// Tiny in-memory GET cache: reopening a section within 30s is instant,
// and any mutation (POST/PATCH/DELETE) busts it so data never goes stale.
const cache = new Map<string, { at: number; data: any }>();
const CACHE_TTL = 60 * 1000;
// Persisted to localStorage so revisits + offline are instant (topics, sessions, roadmaps...)
const LS_PREFIX = "ff_c:";
const MAX_PERSIST = 400_000;

function cacheSet(path: string, at: number, data: any) {
  cache.set(path, { at, data });
  try {
    const raw = JSON.stringify({ at, data });
    if (raw.length <= MAX_PERSIST) localStorage.setItem(LS_PREFIX + path, raw);
  } catch {}
}

// Seed memory cache from localStorage on boot
if (typeof window !== "undefined") {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(LS_PREFIX)) {
        const raw = JSON.parse(localStorage.getItem(k) || "null");
        if (raw && typeof raw.at === "number" && raw.data !== undefined) {
          cache.set(k.slice(LS_PREFIX.length), raw);
        }
      }
    }
  } catch {}
}
// Dedupes concurrent identical GETs (two components asking at once = one request)
const inflight = new Map<string, Promise<any>>();

export function bustCache(prefix?: string) {
  const drop: string[] = [];
  cache.forEach((_v, k) => { if (!prefix || k.startsWith(prefix)) drop.push(k); });
  for (const k of drop) cache.delete(k);
  if (typeof window !== "undefined") {
    try {
      const lsDrop: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(LS_PREFIX) && (!prefix || k.slice(LS_PREFIX.length).startsWith(prefix))) {
          lsDrop.push(k);
        }
      }
      for (const k of lsDrop) localStorage.removeItem(k);
    } catch {}
  }
}

export async function api(path: string, options?: RequestInit, opts?: { queueOffline?: boolean }) {
  const method = (options?.method || "GET").toUpperCase();
  if (method === "GET" && inflight.has(path)) return inflight.get(path)!;
  const p = apiRequest(path, options, opts);
  if (method === "GET") {
    inflight.set(path, p);
    const clear = () => inflight.delete(path);
    p.then(clear, clear);
  }
  return p;
}

async function apiRequest(path: string, options?: RequestInit, opts?: { queueOffline?: boolean }) {
  let res: Response;
  try {
    res = await fetch(path, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    });
  } catch {
    // Network failure (offline). Queue the mutation instead of losing it.
    if (opts?.queueOffline && (options?.method || "GET").toUpperCase() !== "GET") {
      enqueueOffline(path, (options?.method || "GET").toUpperCase(), typeof options?.body === "string" ? options.body : undefined);
      return { _queued: true } as any;
    }
    throw new Error("No internet connection");
  }
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

  const reload = useCallback(async (background = false) => {
    if (!path) return;
    if (!background) {
      setLoading(true);
      setError(null);
    }
    try {
      const d = await api(path);
      cacheSet(path, Date.now(), d);
      setData(d);
    } catch (e: any) {
      // offline: keep showing cached data silently
      if (!background && (typeof navigator === "undefined" || navigator.onLine)) setError(e.message);
    } finally {
      if (!background) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  useEffect(() => {
    if (!path) return;
    // Offline: serve whatever we have (even stale), never hit the network
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      const off = cache.get(path);
      if (off) {
        setData(off.data);
        setLoading(false);
        setError(null);
      }
      return;
    }
    const hit = cache.get(path);
    if (hit) {
      // show cached data instantly; refresh in background if stale
      setData(hit.data);
      setLoading(false);
      setError(null);
      if (Date.now() - hit.at >= CACHE_TTL) reload(true);
      return;
    }
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload, ...deps]);

  // Refresh when the connection comes back
  useEffect(() => {
    const onOnline = () => reload(true);
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload]);

  // After offline mutations sync, visible data refreshes itself.
  useEffect(() => {
    const onSync = () => { reload(); };
    window.addEventListener("ff-sync", onSync);
    return () => window.removeEventListener("ff-sync", onSync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload]);
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
