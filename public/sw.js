const CACHE_NAME = "scheduleo-v2"
const urlsToCache = ["/", "/empleados", "/fichajes", "/vacaciones"]

self.addEventListener("install", event => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  )
})

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(nombres =>
      Promise.all(
        nombres.filter(nombre => nombre !== CACHE_NAME).map(nombre => caches.delete(nombre))
      )
    ).then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", event => {
  // Solo cacheamos peticiones GET de nuestro propio origen (evita el error
  // de CSP con Google Fonts que vimos: ese dominio nunca debe pasar por aqui)
  if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) {
    return
  }
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        return response
      })
      .catch(() => caches.match(event.request))
  )
})