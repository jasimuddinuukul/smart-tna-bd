/**
 * SMART TNA BD ERP — Service Worker
 * Enables: Offline support, App Install, Fast Loading
 */

const APP_VERSION  = "v1.0.0";
const CACHE_NAME   = "tna-bd-" + APP_VERSION;

/* ── Files to cache for offline use ── */
const STATIC_FILES = [
  "/smart-tna-bd/",
  "/smart-tna-bd/login.html",
  "/smart-tna-bd/dashboard.html",
  "/smart-tna-bd/tna-management.html",
  "/smart-tna-bd/orders.html",
  "/smart-tna-bd/sample.html",
  "/smart-tna-bd/knitting.html",
  "/smart-tna-bd/dyeing.html",
  "/smart-tna-bd/laboratory.html",
  "/smart-tna-bd/cutting.html",
  "/smart-tna-bd/print-emb.html",
  "/smart-tna-bd/sewing.html",
  "/smart-tna-bd/washing.html",
  "/smart-tna-bd/finishing.html",
  "/smart-tna-bd/shipment.html",
  "/smart-tna-bd/reports.html",
  "/smart-tna-bd/admin.html",
  "/smart-tna-bd/merchandising.html",
  "/smart-tna-bd/settings.html",
  "/smart-tna-bd/manifest.json",
  "/smart-tna-bd/icons/icon-192.png",
  "/smart-tna-bd/icons/icon-512.png"
];

/* ══ INSTALL — cache all static files ══ */
self.addEventListener("install", event => {
  console.log("[SW] Installing SMART TNA BD ERP " + APP_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_FILES).catch(err => {
        console.warn("[SW] Some files failed to cache:", err);
      });
    }).then(() => {
      self.skipWaiting(); /* activate immediately */
    })
  );
});

/* ══ ACTIVATE — delete old caches ══ */
self.addEventListener("activate", event => {
  console.log("[SW] Activating " + APP_VERSION);
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim())
  );
});

/* ══ FETCH — serve from cache, fallback to network ══ */
self.addEventListener("fetch", event => {
  const url = event.request.url;

  /* Firebase requests — always go to network (real-time data) */
  if (
    url.includes("firestore.googleapis.com") ||
    url.includes("firebase") ||
    url.includes("googleapis.com") ||
    url.includes("google.com/identitytoolkit")
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  /* Google Fonts — network first, fallback cache */
  if (url.includes("fonts.googleapis.com") || url.includes("fonts.gstatic.com")) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  /* App files — Cache First strategy */
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      /* Not in cache — fetch from network */
      return fetch(event.request).then(response => {
        /* Only cache successful responses */
        if (!response || response.status !== 200 || response.type === "opaque") {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        /* Offline fallback */
        if (event.request.destination === "document") {
          return caches.match("/smart-tna-bd/dashboard.html");
        }
      });
    })
  );
});

/* ══ SYNC — background sync when back online ══ */
self.addEventListener("sync", event => {
  if (event.tag === "sync-updates") {
    console.log("[SW] Background sync triggered");
  }
});

/* ══ PUSH NOTIFICATION (future use) ══ */
self.addEventListener("push", event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "SMART TNA BD";
  const options = {
    body: data.body || "নতুন আপডেট আছে",
    icon: "/smart-tna-bd/icons/icon-192.png",
    badge: "/smart-tna-bd/icons/icon-72.png",
    vibrate: [200, 100, 200],
    data: { url: data.url || "/smart-tna-bd/dashboard.html" }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
