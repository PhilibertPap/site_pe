// Service worker : le site reste consultable sans réseau (en mer, au port).
// Généré par build.mjs : la version et la liste des fichiers sont remplacées à chaque build.
const VERSION = '6ba1da6a7f';
const CACHE = 'pe-' + VERSION;
const FILES = ["annales/index.html","carnet/index.html","chefs/equipages.html","chefs/index.html","chefs/resultats.html","compte/index.html","cours/01-carte.html","cours/02-compas.html","cours/03-estime.html","cours/04-maree.html","cours/05-balisage.html","cours/06-ripam.html","cours/07-signaux.html","cours/08-meteo.html","cours/09-securite.html","cours/10-vhf.html","cours/index.html","cqcf/avaries.html","cqcf/bateau-secu.html","cqcf/diplomes.html","cqcf/dossier.html","cqcf/flottille.html","cqcf/habitables.html","cqcf/index.html","cqcf/oral.html","cqcf/pedagogie.html","cqcf/preparer.html","css/style.css","equipage/index.html","equipages/index.html","exercices/compas.html","exercices/estime.html","exercices/index.html","exercices/maree.html","exercices/problemes.html","img/embleme.svg","img/favicon.svg","img/icon-180.png","img/icon-192.png","img/icon-512.png","index.html","js/agregats.js","js/attendus.js","js/auth.js","js/carnet.js","js/chefs-equipages.js","js/chefs.js","js/classement.js","js/compte.js","js/courbe.js","js/diplomes.js","js/equipage.js","js/equipages.js","js/exos.js","js/fb.js","js/figures.js","js/firebase-config.js","js/outils.js","js/qcm/balisage.js","js/qcm/bord.js","js/qcm/dessins.js","js/qcm/feux.js","js/qcm/figure.js","js/qcm/generees.js","js/qcm/index.js","js/qcm/meteo.js","js/qcm/ripam.js","js/qcm/securite.js","js/qcm/signaux.js","js/qcm/vhf.js","js/qcm.js","js/questions.js","js/resultats.js","js/saison.js","js/site.js","parcours/cf.html","parcours/cq.html","parcours/pe.html","pratique/avaries.html","pratique/bateaux.html","pratique/chef-de-bord.html","pratique/entrainement.html","pratique/hlm.html","pratique/index.html","pratique/manoeuvres.html","pratique/mouillage.html","pratique/noeuds.html","pratique/oral-pe.html","pratique/physique.html","pratique/port.html","pratique/reglages.html","pratique/voilier.html","qcm/index.html","questions/index.html","questions/question.html"];

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
