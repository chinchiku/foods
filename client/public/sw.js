const CACHE_NAME = 'food-expiry-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/index.css',
  '/assets/index.js',
  '/src/assets/food-background.svg',
  '/src/assets/veggies.svg',
];

// インストール中にリソースをキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('キャッシュを開きました');
        return cache.addAll(urlsToCache);
      })
  );
});

// キャッシュ管理
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// リクエストをキャッシュまたはネットワークから取得
self.addEventListener('fetch', (event) => {
  // APIリクエストの場合はネットワークファーストを使用
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // レスポンスをクローンしてキャッシュに保存
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          // オフラインの場合はキャッシュから取得
          return caches.match(event.request);
        })
    );
  } else {
    // 静的アセットの場合はキャッシュファーストを使用
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // キャッシュがあればそれを返す
          if (response) {
            return response;
          }

          // キャッシュになければネットワークからフェッチ
          return fetch(event.request).then(
            (response) => {
              // 有効なレスポンスでなければそのまま返す
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // レスポンスをクローンしてキャッシュに保存
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });

              return response;
            }
          );
        })
    );
  }
});