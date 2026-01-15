/**
 * Tower Defense - Service Worker
 * Offline çalışma ve cache yönetimi
 */

const CACHE_NAME = 'td-game-v1.7.1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/style.css',
    '/js/config.js',
    '/js/utils.js',
    '/js/maps/maps.js',
    '/js/systems/Grid.js',
    '/js/systems/SoundManager.js',
    '/js/systems/ParticleSystem.js',
    '/js/systems/PlayerManager.js',
    '/js/entities/Enemy.js',
    '/js/entities/Tower.js',
    '/js/entities/Projectile.js',
    '/js/systems/WaveManager.js',
    '/js/systems/Renderer.js',
    '/js/systems/InputHandler.js',
    '/js/systems/MenuManager.js',
    '/js/Game.js',
    '/js/main.js',
    '/assets/images/icon-192.svg',
    '/assets/images/icon-512.svg'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
            .catch((err) => console.log('[SW] Cache failed:', err))
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                if (response) {
                    return response;
                }
                
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Don't cache non-successful responses
                        if (!networkResponse || networkResponse.status !== 200) {
                            return networkResponse;
                        }
                        
                        // Clone and cache the response
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return networkResponse;
                    })
                    .catch(() => {
                        // Offline fallback for HTML pages
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});
