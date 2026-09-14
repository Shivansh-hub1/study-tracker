"use client";

import { useEffect, useState } from "react";
import { bustCache } from "./client";

export type OutboxItem = { id: string; path: string; method: string; body?: string; ts: number };
const KEY = "ff_outbox_v1";

export function loadOutbox(): OutboxItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function saveOutbox(items: OutboxItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {}
  if (typeof window !== "undefined") window.dispatchEvent(new Event("ff-outbox"));
}

/** Stash a failed mutation on the device; flushOutbox() replays it later. */
export function enqueueOffline(path: string, method: string, body?: string) {
  const items = loadOutbox();
  items.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    path,
    method,
    body,
    ts: Date.now(),
  });
  saveOutbox(items);
}

export function pendingCount() {
  return typeof window === "undefined" ? 0 : loadOutbox().length;
}

let flushing = false;

/**
 * Replay queued mutations in order. Stops at the first failure and keeps
 * the rest queued (e.g. session expired or still offline).
 */
export async function flushOutbox(): Promise<{ synced: number; failed: boolean }> {
  if (flushing || typeof window === "undefined" || !navigator.onLine) {
    return { synced: 0, failed: false };
  }
  let items = loadOutbox();
  if (!items.length) return { synced: 0, failed: false };
  flushing = true;
  let synced = 0;
  let failed = false;
  try {
    for (const it of items) {
      try {
        const res = await fetch(it.path, {
          method: it.method,
          headers: { "Content-Type": "application/json" },
          body: it.body,
        });
        if (!res.ok) {
          failed = true;
          break;
        }
        items = items.filter((x) => x.id !== it.id);
        saveOutbox(items);
        synced++;
      } catch {
        failed = true;
        break;
      }
    }
  } finally {
    flushing = false;
  }
  if (synced > 0) {
    bustCache();
    window.dispatchEvent(new Event("ff-sync"));
  }
  return { synced, failed };
}

export function useOfflineStatus() {
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine
  );
  const [pending, setPending] = useState(0);
  useEffect(() => {
    const upd = () => {
      setOnline(navigator.onLine);
      setPending(loadOutbox().length);
    };
    upd();
    window.addEventListener("online", upd);
    window.addEventListener("offline", upd);
    window.addEventListener("ff-outbox", upd);
    return () => {
      window.removeEventListener("online", upd);
      window.removeEventListener("offline", upd);
      window.removeEventListener("ff-outbox", upd);
    };
  }, []);
  return { online, pending };
}
