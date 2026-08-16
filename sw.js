/**
 * SMART TNA BD ERP — Service Worker
 * Version: 1.0.1
 * Network First for HTML pages
 * Cache First for static assets
 */

const APP_VERSION = "v1.0.1";
const CACHE_NAME = "tna-bd-" + APP_VERSION;

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


/* ══════════════════════════════════════
   INSTALL
══════════════════════════════════════ */

self.addEventListener("install", event => {

  console.log("[SW] Installing:", APP_VERSION);

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => {

        return cache.addAll(STATIC_FILES)
          .catch(err => {

            console.warn(
              "[SW] Some files could not be cached:",
              err
            );

          });

      })
      .then(() => {

        /*
         * Activate new SW immediately
         */
        return self.skipWaiting();

      })

  );

});


/* ══════════════════════════════════════
   ACTIVATE
══════════════════════════════════════ */

self.addEventListener("activate", event => {

  console.log("[SW] Activating:", APP_VERSION);

  event.waitUntil(

    caches.keys()
      .then(keys => {

        return Promise.all(

          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => {

              console.log(
                "[SW] Deleting old cache:",
                key
              );

              return caches.delete(key);

            })

        );

      })
      .then(() => {

        /*
         * Take control of all open pages
         */
        return self.clients.claim();

      })

  );

});


/* ══════════════════════════════════════
   FETCH
══════════════════════════════════════ */

self.addEventListener("fetch", event => {

  const request = event.request;
  const url = request.url;


  /* ─────────────────────────────────────
     Firebase / Google API
     ALWAYS NETWORK
  ───────────────────────────────────── */

  if (
    url.includes("firestore.googleapis.com") ||
    url.includes("firebase") ||
    url.includes("googleapis.com") ||
    url.includes("google.com/identitytoolkit")
  ) {

    event.respondWith(
      fetch(request)
    );

    return;

  }


  /* ─────────────────────────────────────
     HTML DOCUMENTS
     NETWORK FIRST
     
     This is the IMPORTANT FIX.
  ───────────────────────────────────── */

  if (
    request.destination === "document" ||
    request.headers.get("accept")?.includes("text/html")
  ) {

    event.respondWith(

      fetch(request)

        .then(response => {

          /*
           * Save latest HTML to cache
           */
          if (
            response &&
            response.status === 200
          ) {

            const clone = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {

                cache.put(request, clone);

              });

          }

          return response;

        })

        .catch(() => {

          /*
           * Offline → use cached HTML
           */

          return caches.match(request)
            .then(cached => {

              if (cached) {
                return cached;
              }

              /*
               * Final offline fallback
               */
              return caches.match(
                "/smart-tna-bd/dashboard.html"
              );

            });

        })

    );

    return;

  }


  /* ─────────────────────────────────────
     GOOGLE FONTS
     NETWORK FIRST
  ───────────────────────────────────── */

  if (
    url.includes("fonts.googleapis.com") ||
    url.includes("fonts.gstatic.com")
  ) {

    event.respondWith(

      fetch(request)

        .then(response => {

          const clone = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {

              cache.put(request, clone);

            });

          return response;

        })

        .catch(() => {

          return caches.match(request);

        })

    );

    return;

  }


  /* ─────────────────────────────────────
     OTHER STATIC FILES
     CACHE FIRST
  ───────────────────────────────────── */

  event.respondWith(

    caches.match(request)

      .then(cached => {

        if (cached) {
          return cached;
        }

        return fetch(request)

          .then(response => {

            if (
              !response ||
              response.status !== 200 ||
              response.type === "opaque"
            ) {

              return response;

            }

            const clone = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {

                cache.put(request, clone);

              });

            return response;

          });

      })

  );

});


/* ══════════════════════════════════════
   BACKGROUND SYNC
══════════════════════════════════════ */

self.addEventListener("sync", event => {

  if (event.tag === "sync-updates") {

    console.log(
      "[SW] Background sync triggered"
    );

  }

});


/* ══════════════════════════════════════
   PUSH NOTIFICATION
══════════════════════════════════════ */

self.addEventListener("push", event => {

  const data =
    event.data
      ? event.data.json()
      : {};

  const title =
    data.title ||
    "SMART TNA BD";

  const options = {

    body:
      data.body ||
      "নতুন আপডেট আছে",

    icon:
      "/smart-tna-bd/icons/icon-192.png",

    badge:
      "/smart-tna-bd/icons/icon-72.png",

    vibrate: [
      200,
      100,
      200
    ],

    data: {

      url:
        data.url ||
        "/smart-tna-bd/dashboard.html"

    }

  };

  event.waitUntil(

    self.registration.showNotification(
      title,
      options
    )

  );

});


/* ══════════════════════════════════════
   NOTIFICATION CLICK
══════════════════════════════════════ */

self.addEventListener(
  "notificationclick",
  event => {

    event.notification.close();

    event.waitUntil(

      clients.openWindow(
        event.notification.data.url
      )

    );

  }
);
