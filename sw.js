const CACHE_NAME = 'somnia-core-v1';

// The core physical components of your manor
const CORE_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './SomniaScourings1.png',
    './rain.mp3',
    './thunder.mp3',
    './winterwind.mp3',
    './owls.mp3',
    './raven.mp3',
    './frogs.mp3',
    './crickets.mp3',
    './fire.mp3',
    './clock.mp3',
    './cat.mp3',
    './windchimes.mp3',
    './musicbox1.mp3'
];

// INSTALL: Hoard the core assets into the local vault
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Force the new worker to activate immediately
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SomniaScourings] Sealing the vault...');
            return cache.addAll(CORE_ASSETS);
        })
    );
});

// ACTIVATE: Sweep out old caches if you update the version number
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SomniaScourings] Banishing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// FETCH: Serve from local cache first, fall back to network
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Bypass the cache entirely for the Castellan's API calls
    if (url.hostname === 'generativelanguage.googleapis.com') {
        return; 
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse; // Return the local asset instantly
            }

            // If not in cache, fetch from the outside world
            return fetch(event.request).then((networkResponse) => {
                // Don't cache dynamic or external responses automatically 
                // to keep the workshop pristine
                return networkResponse;
            }).catch(() => {
                // Optional: Return a highly specific fallback if offline and asset is missing
                console.warn('[SomniaScourings] Asset missing from the void:', event.request.url);
            });
        })
    );
});
