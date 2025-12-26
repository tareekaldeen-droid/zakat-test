const CACHE_NAME = 'zakat-app-v3.0.1'; // قم بتغيير هذا الرقم كلما عدلت في HTML ليحدث عند الجميع فوراً
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Amiri:wght@400;700&display=swap'
];

// التثبيت
self.addEventListener('install', (event) => {
  self.skipWaiting(); // فرض التحديث الفوري
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// التفعيل وحذف الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim()) // السيطرة الفورية على الصفحات المفتوحة
  );
});

// استراتيجية الشبكة أولاً للمحتوى (لضمان التحديث) ثم الكاش
self.addEventListener('fetch', (event) => {
  // استثناء ملف الإشعارات ليتم جلبه دائماً من الشبكة
  if (event.request.url.includes('notifications.json')) {
    event.respondWith(fetch(event.request).catch(() => null));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
