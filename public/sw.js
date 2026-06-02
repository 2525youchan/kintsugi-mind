// KINTSUGI MIND Service Worker
// dev-bible 4-1: Cache versioning - increment on every deploy
const CACHE_NAME = 'kintsugi-mind-v16';
// Cloudflare Pages serves /offline.html via a clean URL (308 -> /offline),
// so reference the clean URL to avoid a redirect that breaks cache.addAll.
const OFFLINE_URL = '/offline.html';

// Assets to cache on install (only local assets, no external CDN).
// NOTE: cache.addAll() rejects the WHOLE batch if ANY single request fails
// (non-200, redirect, CORS). Cloudflare Pages 308-redirects /offline.html
// which previously broke install. We now cache each asset individually so a
// single failure never blocks Service Worker installation (dev-bible 4-1).
const PRECACHE_ASSETS = [
  '/',
  '/check-in',
  '/garden',
  '/study',
  '/tatami',
  '/profile',
  '/about/kintsugi',
  '/static/style.css',
  '/static/app.js',
  '/manifest.json',
  '/offline.html'
  // Note: External CDN (tailwindcss) is excluded as it has CORS issues with service worker caching
];

// Cache a single asset, following redirects manually so we store a clean,
// non-redirected Response (Cache API cannot store a redirected Response for
// a navigation request match). Failures are logged but never rejected.
async function cacheOne(cache, asset) {
  try {
    // redirect: 'follow' resolves 308 -> final URL; if final is 200 we cache it.
    const response = await fetch(asset, { redirect: 'follow' });
    if (response && response.ok) {
      await cache.put(asset, response.clone());
    } else {
      console.warn('[SW] Skipped (non-OK):', asset, response && response.status);
    }
  } catch (err) {
    console.warn('[SW] Skipped (error):', asset, err && err.message);
  }
}

// Install event - cache core assets individually (fault-tolerant)
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log('[SW] Caching core assets (individually)');
        // Use allSettled-style loop so one bad asset never aborts install.
        await Promise.all(PRECACHE_ASSETS.map((asset) => cacheOne(cache, asset)));
        console.log('[SW] Service Worker installed');
        return self.skipWaiting();
      })
      .catch((error) => {
        // Should rarely happen now, but never block install entirely.
        console.error('[SW] Install error (continuing):', error);
        return self.skipWaiting();
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests early
  if (request.method !== 'GET') {
    return;
  }
  
  // Safely parse URL - handle any scheme issues
  let url;
  try {
    url = new URL(request.url);
  } catch (e) {
    console.log('[SW] Invalid URL, skipping:', request.url);
    return;
  }
  
  // Skip unsupported schemes (chrome-extension, moz-extension, etc.)
  // These cause TypeError when trying to cache
  const supportedProtocols = ['http:', 'https:'];
  if (!supportedProtocols.includes(url.protocol)) {
    // Don't try to handle browser extension requests
    return;
  }
  
  // Skip external CDN requests (they may have CORS issues)
  // This prevents CORS errors with tailwindcss and other CDNs
  if (url.hostname !== self.location.hostname) {
    // Let the browser handle external requests normally
    return;
  }
  
  // Skip API requests (always fetch from network)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // dev-bible 5-1: Specific error message for offline state
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'オフラインです。インターネットに接続してください。', 
              code: 'OFFLINE',
              retryable: true 
            }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }
  
  // For page navigations - Network first, cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Try cache first
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return offline page as last resort
              return caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }
  
  // For static assets - Cache first, network fallback
  if (url.pathname.startsWith('/static/') || 
      url.pathname.startsWith('/icons/') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.ico')) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            // Return cache and update in background
            fetch(request)
              .then((response) => {
                if (response.ok) {
                  caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, response);
                  });
                }
              })
              .catch(() => {});
            return cachedResponse;
          }
          // Not in cache, fetch from network
          return fetch(request)
            .then((response) => {
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, responseClone);
                });
              }
              return response;
            });
        })
    );
    return;
  }
  
  // Default: Network first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Background sync for offline actions (future use)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
});

// Push notifications (future use)
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
});
