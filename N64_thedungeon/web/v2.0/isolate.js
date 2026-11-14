self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.url.indexOf(self.location.origin + '/') !== 0) return;
  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') return;
  event.respondWith(fetch(request).then(function (response) {
    var headers;
    if (response.status === 0 || response.type === 'opaqueredirect') return response;
    headers = new Headers(response.headers);
    headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
    return new Response(response.status === 204 || response.status === 304 ? null : response.body,
      { status: response.status, statusText: response.statusText, headers: headers });
  }));
});
