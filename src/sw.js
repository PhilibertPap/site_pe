// Service worker : le site reste consultable sans réseau (en mer, au port).
// Généré par build.mjs : la version et la liste des fichiers sont remplacées à chaque build.
const VERSION = '__VERSION__';
const CACHE = 'pe-' + VERSION;
const FILES = __FILES__;

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('pe-') && k !== CACHE && k !== 'pe-ext').map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Firebase (connexion, base) : jamais mis en cache, sauf le code du SDK
  if (/googleapis\.com$|firebaseio|identitytoolkit|securetoken/.test(url.hostname) && !url.hostname.startsWith('fonts.')) return;

  // Polices et SDK Firebase : servis depuis le cache, mis à jour en arrière-plan
  if (url.origin !== location.origin) {
    if (/fonts\.(googleapis|gstatic)\.com$|www\.gstatic\.com$/.test(url.hostname)) {
      e.respondWith(
        caches.open('pe-ext').then((c) =>
          c.match(req).then((hit) => {
            const net = fetch(req)
              .then((res) => {
                if (res.ok || res.type === 'opaque') c.put(req, res.clone());
                return res;
              })
              .catch(() => hit || Response.error());
            return hit || net;
          })
        )
      );
    }
    return;
  }

  // Pages du site : réseau d'abord (contenu à jour), cache si pas de réseau
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('index.html')))
    );
    return;
  }

  // Le reste (CSS, JS, images, PDF) : cache d'abord
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok && !url.pathname.includes('/fichiers/')) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
    )
  );
});
