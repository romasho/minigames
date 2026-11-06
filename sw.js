const VERSION = "8609f1ffd4ab4a3d";
const FILES = ["assets/camper-van-make-it-home-card-61XprhL7.jpg","assets/cast-n-chill-card-CRLWRuq0.jpg","assets/cat-chess-card-BkETDAfr.jpg","assets/cat-mail-co-card-B0GMTC_n.jpg","assets/cozy-solitaire-card-CSczvhq9.jpg","assets/cozy-sudoku-card-CyAOOis5.jpg","assets/grimshire-card-D1QcLtZT.jpg","assets/heartopia-card-DRd_6OVG.jpg","assets/hero-background-BjRnG4tW.png","assets/illustration-side-Jw8T4Pdf.png","assets/index-BIQ_25JL.js","assets/index-DMPZFKFL.css","assets/inter-400-BMa5IoM-.ttf","assets/inter-500-DvphOyYU.ttf","assets/inter-700-DJlYPwri.ttf","assets/islanders-new-shores-card-DljrohUL.jpg","assets/koroneko-card-BXvG49TG.jpg","assets/leaf-it-alone-card-CGXXB8uI.jpg","assets/leafy-corner-card-CAdJaXNI.jpg","assets/little-corners-card-BzTzTJLT.jpg","assets/minigames-logo-BJZjfCUO.png","assets/organized-inside-card-CyWIV6Rk.jpg","assets/palia-card-8xT8yeZQ.jpg","assets/shelve-the-potions-card-DTY_N_zq.jpg","assets/tailside-cozy-cafe-sim-card-C7B0rePC.jpg","assets/the-wild-at-heart-card-DfO3UIaM.jpg","assets/tiny-glade-card-CS2XLEzK.jpg","assets/tukoni-forest-keepers-card-CkPF-Hda.jpg","assets/vacation-cafe-simulator-card-Bzcyczbo.jpg","assets/whisper-of-the-house-card-BE7Dq45b.jpg","assets/winter-burrow-card-KbzzF82b.jpg","assets/wytchwood-card-XvNmJ299.jpg","icons/icon-192.png","icons/icon-512.png","index.html","manifest.webmanifest"];
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
