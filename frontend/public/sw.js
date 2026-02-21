const CACHE_VERSION = "v1.0.0";
const STATIC_CACHE = `denemetakip-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `denemetakip-runtime-${CACHE_VERSION}`;

const APP_SHELL = [
  "/",
  "/dashboard",
  "/offline.html",
  "/manifest.webmanifest",
  "/icons/favicon-32x32.png",
  "/icons/icon-72x72.png",
  "/icons/icon-96x96.png",
  "/icons/icon-128x128.png",
  "/icons/icon-144x144.png",
  "/icons/icon-152x152.png",
  "/icons/icon-192x192.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => ![STATIC_CACHE, RUNTIME_CACHE].includes(name))
          .map((name) => caches.delete(name)),
      );

      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
    })(),
  );

  self.clients.claim();
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  const cache = await caches.open(RUNTIME_CACHE);
  cache.put(request, response.clone());
  return response;
}

async function networkFirst(request, fallbackResponse) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    if (fallbackResponse) {
      return fallbackResponse;
    }
    return new Response("Offline", { status: 503 });
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (!url.protocol.startsWith("http")) {
    return;
  }

  const isNavigation = request.mode === "navigate";
  const isStaticAsset = ["style", "script", "font", "image", "worker"].includes(
    request.destination,
  );
  const isManifestOrIcon =
    url.pathname === "/manifest.webmanifest" ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/pwa-icons/");
  const isApiGet = url.pathname.startsWith("/api/");

  if (isNavigation) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(request, response.clone());
          return response;
        } catch {
          const cached = await caches.match(request);
          if (cached) {
            return cached;
          }
          return caches.match("/offline.html");
        }
      })(),
    );
    return;
  }

  if (isStaticAsset || isManifestOrIcon) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (isApiGet) {
    event.respondWith(
      networkFirst(
        request,
        new Response(JSON.stringify({ message: "Cevrimdisi" }), {
          status: 503,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        }),
      ),
    );
  }
});

self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  let payload = {};
  try {
    payload = event.data.json();
  } catch {
    payload = { body: event.data.text() };
  }

  const title = payload.title || "Yeni bildirim";
  const body = payload.body || "Uygulamada yeni bir gelisme var.";
  const icon = payload.icon || "/icons/icon-192x192.png";
  const badge = payload.badge || "/icons/icon-96x96.png";
  const url = payload.url || "/dashboard/notifications";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      data: {
        url,
        campaignId: payload.campaignId,
        type: payload.type,
      },
      tag: payload.campaignId || undefined,
      renotify: false,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || "/dashboard/notifications";

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of allClients) {
        if ("focus" in client) {
          try {
            await client.focus();
            if ("navigate" in client) {
              await client.navigate(targetUrl);
            }
            return;
          } catch {
            // continue and open a fresh window
          }
        }
      }
      if (self.clients.openWindow) {
        await self.clients.openWindow(targetUrl);
      }
    })(),
  );
});
