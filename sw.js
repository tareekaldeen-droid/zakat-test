const CACHE_NAME = 'zakat-app-v4.0.0';
const ASSETS = [
  './',
  './index.html',
  './manifest_ar.json',
  './manifest_tr.json',
  './notifications.json',
  'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdn.jsdelivr.net/npm/jspdf-arabic@1.0.1/dist/jspdf-arabic.min.js'
];

// التثبيت
self.addEventListener('install', (event) => {
  self.skipWaiting(); // فرض التحديث فوراً
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// التفعيل والتنظيف
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

// استراتيجية الشبكة أولاً للمحتوى الديناميكي (لضمان التحديث)
self.addEventListener('fetch', (event) => {
  // للملفات الأساسية وملف الإشعارات، اطلب من الشبكة دائماً أولاً
  if (event.request.url.includes('index.html') || event.request.url.includes('notifications.json')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // باقي الملفات: الكاش أولاً
    event.respondWith(
      caches.match(event.request).then((res) => res || fetch(event.request))
    );
  }
});

