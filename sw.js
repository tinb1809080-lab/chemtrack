
const CACHE_NAME = 'chemtrack-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './index.tsx',
  './metadata.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Trả về từ cache nếu có, nếu không thì fetch từ network
      return response || fetch(event.request).then(fetchRes => {
        return caches.open(CACHE_NAME).then(cache => {
          // Chỉ cache các tài nguyên từ esm.sh hoặc các file tĩnh
          if (event.request.url.includes('esm.sh') || event.request.url.includes('cdnjs')) {
            cache.put(event.request.url, fetchRes.clone());
          }
          return fetchRes;
        });
      });
    }).catch(() => {
      // Nếu mất mạng và không có trong cache (ví dụ API AI), trả về lỗi nhẹ nhàng
      if (event.request.headers.get('accept').includes('text/html')) {
        return caches.match('./index.html');
      }
    })
  );
});
