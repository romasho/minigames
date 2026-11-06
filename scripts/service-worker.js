const scope = self.registration.scope;
const prefix = `minigames-shell:${scope}:`;
const cacheName = `${prefix}${VERSION}`;
const urls = new Set(FILES.map((file) => new URL(file, scope).href));
const indexUrl = new URL('index.html', scope).href;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(cacheName)
      .then((cache) =>
        cache.addAll(
          [...urls].map((url) => new Request(url, { cache: 'reload' })),
        ),
      ),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(prefix) && key !== cacheName)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || !request.url.startsWith(scope)) return;

  // Keep the HTML and hashed assets on the same build until the next worker activates.
  const url = request.mode === 'navigate' ? indexUrl : request.url;
  if (!urls.has(url)) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(cacheName);
      return (await cache.match(url)) ?? fetch(request);
    })(),
  );
});
