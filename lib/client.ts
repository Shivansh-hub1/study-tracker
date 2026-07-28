"use client";

import { useCallback, useEffect, useState } from "react";

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
      setData(await api(path));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  useEffect(() => { reload(); }, [reload, ...deps]);
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
