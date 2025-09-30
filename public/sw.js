// public/sw.js
self.addEventListener('install', (event) => {
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  clients.claim();
});
// Not: fetch handler zorunlu değil; sadece var olması yeterli.
