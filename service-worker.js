// Fura Handbók — offline cache (virkar þegar appið er hýst á netinu / https)
const CACHE = 'fura-handbok-v3';
const IMG_CACHE = 'fura-handbok-img-v1';   // myndir geymast varanlega (cache-first)
const SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './supabase-config.js',
  './manifest.webmanifest',
  './icons/icon.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE && k !== IMG_CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function isImage(req){
  if (req.destination === 'image') return true;
  const u = new URL(req.url);
  if (/\.(jpe?g|png|webp|gif|svg|avif)$/i.test(u.pathname)) return true;
  if (u.pathname.includes('/storage/v1/object/')) return true;   // Supabase myndir
  return false;
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // Myndir: cache-first — þær breytast aldrei (einkvæmt nafn), svo eftir fyrstu
  // skoðun koma þær strax úr skyndiminni. Þetta gerir flettingu milli véla snögga.
  if (isImage(req)) {
    e.respondWith(
      caches.open(IMG_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;
        try {
          const res = await fetch(req);
          if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
          return res;
        } catch (err) { return cached || Response.error(); }
      })
    );
    return;
  }

  // Kóði (html/js/css): network-first — svo uppfærslur berist strax, en virkar ónettengt.
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      try {
        const res = await fetch(req);
        if (res && res.status === 200 && res.type === 'basic') cache.put(req, res.clone());
        return res;
      } catch (err) {
        const cached = await cache.match(req);
        return cached || Response.error();
      }
    })
  );
});
