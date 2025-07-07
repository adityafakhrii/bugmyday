import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

const STATIC_CACHE_NAME = 'debugmyday-static-v1';
const DYNAMIC_CACHE_NAME = 'debugmyday-dynamic-v1';

const STATIC_FILES = [
  '/',
  '/index.html',
  '/src/styles/styles.css',
  '/src/scripts/index.js',
  '/src/scripts/app.js',
  '/src/scripts/config.js',
  '/src/scripts/routes/routes.js',
  '/src/scripts/routes/url-parser.js',
  '/src/scripts/utils/index.js',
  '/src/scripts/utils/drawer-initiator.js',
  '/src/scripts/utils/sw-register.js',
  '/src/scripts/models/storage-model.js',
  '/src/scripts/models/indexeddb-model.js',
  '/src/scripts/views/base-view.js',
  '/src/scripts/pages/home/home-page.js',
  '/src/scripts/pages/about/about-page.js',
  '/src/scripts/pages/add/add-page.js',
  '/src/scripts/pages/auth/auth-page.js',
  '/src/scripts/pages/detail/detail-page.js',
  '/src/scripts/pages/favorites/favorites-page.js',
  '/src/scripts/pages/not-found/not-found-page.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  '/icons/icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching Application Shell');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Application Shell cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache Application Shell:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/')
        .then((response) => {
          return response || fetch(request);
        })
        .catch(() => {
          return caches.match('/');
        })
    );
    return;
  }

  if (STATIC_FILES.includes(request.url) || url.pathname.includes('/src/')) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          return response || fetch(request)
            .then((fetchResponse) => {
              const responseClone = fetchResponse.clone();
              caches.open(STATIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
              return fetchResponse;
            });
        })
        .catch(() => {
          if (request.destination === 'document') {
            return caches.match('/');
          }
        })
    );
    return;
  }

  if (url.origin === 'https://story-api.dicoding.dev') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseClone);
            });
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then((response) => {
              if (response) {
                return response;
              }
              return new Response(
                JSON.stringify({
                  error: true,
                  message: 'Aplikasi sedang offline. Beberapa fitur mungkin tidak tersedia.'
                }),
                {
                  headers: { 'Content-Type': 'application/json' },
                  status: 503
                }
              );
            });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((response) => {
        const fetchPromise = fetch(request)
          .then((fetchResponse) => {
            const responseClone = fetchResponse.clone();
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
            return fetchResponse;
          })
          .catch(() => {
            return response;
          });

        return response || fetchPromise;
      })
  );
});

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

registerRoute(
  ({ url }) => url.origin === 'https://story-api.dicoding.dev',
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24,
      }),
    ],
  })
);

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  })
);

registerRoute(
  ({ url }) => 
    url.origin === 'https://fonts.googleapis.com' ||
    url.origin === 'https://fonts.gstatic.com' ||
    url.origin === 'https://cdnjs.cloudflare.com' ||
    url.origin === 'https://unpkg.com',
  new StaleWhileRevalidate({
    cacheName: 'external-resources',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 7,
      }),
    ],
  })
);

registerRoute(
  ({ url }) => 
    url.hostname.includes('tile.openstreetmap.org') ||
    url.hostname.includes('server.arcgisonline.com') ||
    url.hostname.includes('basemaps.cartocdn.com'),
  new CacheFirst({
    cacheName: 'map-tiles',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 7,
      }),
    ],
  })
);

self.addEventListener('push', (event) => {
  let title = 'DebugMyDay';
  let options = {
    body: 'Anda memiliki notifikasi baru dari DebugMyDay',
    icon: '/icons/icon.png',
    badge: '/icons/icon.png',
    vibrate: [100, 50, 100],
    tag: 'debugmyday-notification',
    requireInteraction: true,
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: '/#/home'
    },
    actions: [
      {
        action: 'explore',
        title: 'Lihat Cerita',
        icon: '/icons/icon.png'
      },
      {
        action: 'close',
        title: 'Tutup',
        icon: '/icons/icon.png'
      }
    ]
  };

  if (event.data) {
    try {
      const notificationData = event.data.json();
      title = notificationData.title || title;
      options.body = notificationData.options?.body || options.body;
      
      if (notificationData.options?.url) {
        options.data.url = notificationData.options.url;
      }
    } catch (error) {
      console.error('Error parsing push notification data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  } else if (event.action === 'close') {
  } else {
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  }
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('Background sync triggered');
}