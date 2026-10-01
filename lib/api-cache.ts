// Per-user in-memory GET cache for API routes.
// Short TTL + bustUser() on every mutation = fast reads, never stale.
// Keys are namespaced per user: "u<id>:<route>:<variant>"

type Entry = { at: number; data: any };

const store = new Map<string, Entry>();
const DEFAULT_TTL = 5_000; // ms — covers bursts of page loads, stays fresh
const MAX_ENTRIES = 400;

export function cacheGet<T = any>(key: string, ttl: number = DEFAULT_TTL): T | null {
  const e = store.get(key);
  if (!e) return null;
  if (Date.now() - e.at > ttl) {
    store.delete(key);
    return null;
  }
  return e.data as T;
}

export function cacheSet(key: string, data: any) {
  if (store.size >= MAX_ENTRIES) {
    // drop the oldest quarter so the map never grows unbounded
    const all: { k: string; at: number }[] = [];
    store.forEach((v, k) => all.push({ k, at: v.at }));
    all.sort((a, b) => a.at - b.at);
    for (let i = 0; i < 100 && i < all.length; i++) store.delete(all[i].k);
  }
  store.set(key, { at: Date.now(), data });
}

// Call from every mutation (POST/PATCH/PUT/DELETE) — drops all cached GETs for that user.
export function bustUser(userId: number | string) {
  const prefix = `u${userId}:`;
  const drop: string[] = [];
  store.forEach((_v, k) => { if (k.startsWith(prefix)) drop.push(k); });
  for (const k of drop) store.delete(k);
}
