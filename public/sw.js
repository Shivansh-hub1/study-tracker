// Service Worker for FocusFlow PWA
// Provides offline support, caching, and background sync

const CACHE_NAME = "focusflow-v1";
const STATIC_ASSETS = [
  "/",
  "/dsa",
  "/webdev",
  "/revision",
  "/habits",
  "/progress",
  "/achievements",
  "/timer",
  "/about",
  "/privacy",
  "/terms",
  "/signup",
  "/login",
  "/manifest.webmanifest",
  "/opengraph-image",
];

const CACHE_STRATEGIES = {
  // Static assets - cache first
  static: ["GET"],
  // API - network first, fallback to cache
  api: ["GET"],
  // Pages - stale while revalidate
  pages: ["GET"],
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS.map((url) => new Request(url, { credentials: "same-origin" })));
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip cross-origin requests
  if (url.origin !== location.origin) return;

  // Skip API/auth routes - let them go to network
  if (url.pathname.startsWith("/api/")) return;

  // Determine cache strategy
  const isStaticAsset =
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2|woff|ttf|eot|webp|avif)$/) ||
    url.pathname === "/opengraph-image";

  const isPage = !isStaticAsset && !url.pathname.startsWith("/api/");

  if (isStaticAsset) {
    // Cache first for static assets
    event.respondWith(cacheFirst(request));
  } else if (isPage) {
    // Stale while revalidate for pages
    event.respondWith(staleWhileRevalidate(request));
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      const cache = caches.open(CACHE_NAME).then((c) => c.put(request, response.clone()));
    }
    return response;
  }).catch(() => cached);

  return cached || fetchPromise;
}

// Background sync for offline session logging
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-sessions") {
    event.waitUntil(syncSessions());
  }
});

async function syncSessions() {
  try {
    const db = await openDB();
    const tx = db.transaction("pendingSessions", "readwrite");
    const store = tx.objectStore("pendingSessions");
    const sessions = await store.getAll();

    for (const session of sessions) {
      try {
        await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(session.data),
        });
        await store.delete(session.id);
      } catch {
        // Keep in queue for next sync
      }
    }
  } catch {
    // IndexedDB not available or other error
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("FocusFlowOffline", 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("pendingSessions")) {
        db.createObjectStore("pendingSessions", { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "/icon-192.png",
    badge: "/icon-72.png",
    vibrate: [200, 100, 200],
    data: { url: data.url || "/" },
    actions: [
      { action: "open", title: "Open FocusFlow" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "open" || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === event.notification.data.url && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow(event.notification.data.url);
      })
    );
  }
});