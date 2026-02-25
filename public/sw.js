// MediControl Service Worker v1.0.0
// Provides offline support and caching for PWA

const CACHE_NAME = 'medicontrol-v1';
const STATIC_CACHE = 'medicontrol-static-v1';
const DYNAMIC_CACHE = 'medicontrol-dynamic-v1';
const API_CACHE = 'medicontrol-api-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return name !== STATIC_CACHE && 
                     name !== DYNAMIC_CACHE && 
                     name !== API_CACHE;
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API requests - Network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      networkFirst(request, API_CACHE)
    );
    return;
  }

  // Static assets - Cache first, network fallback
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      cacheFirst(request, STATIC_CACHE)
    );
    return;
  }

  // Navigation requests - Network first, cache fallback, offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request, DYNAMIC_CACHE)
        .catch(() => {
          return caches.match('/');
        })
    );
    return;
  }

  // Other requests - Stale while revalidate
  event.respondWith(
    staleWhileRevalidate(request, DYNAMIC_CACHE)
  );
});

// Caching strategies
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    throw error;
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);
  
  return cached || fetchPromise;
}

function isStaticAsset(pathname) {
  return pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|ico|woff|woff2)$/);
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  const data = event.data?.json() || {};
  const title = data.title || 'MediControl';
  const options = {
    body: data.body || 'Tienes una notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey || 1
    },
    actions: [
      {
        action: 'view',
        title: 'Ver',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Descartar',
        icon: '/icons/action-dismiss.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync for offline dose records
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-doses') {
    event.waitUntil(syncDoses());
  }
});

async function syncDoses() {
  // In production, this would sync pending dose records to the server
  console.log('[SW] Syncing dose records...');
  
  try {
    const pendingRecords = await getPendingRecords();
    
    for (const record of pendingRecords) {
      await fetch('/api/sync/doses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
    }
    
    console.log('[SW] Dose records synced successfully');
  } catch (error) {
    console.error('[SW] Failed to sync doses:', error);
    throw error; // Retry later
  }
}

async function getPendingRecords() {
  // This would read from IndexedDB in production
  return [];
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag);
  
  if (event.tag === 'check-medications') {
    event.waitUntil(checkMedications());
  }
});

async function checkMedications() {
  // Check for upcoming doses and send reminders
  console.log('[SW] Checking medications...');
}

console.log('[SW] Service worker loaded');
