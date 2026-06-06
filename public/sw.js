self.addEventListener("push", function(event) {
  const data = event.data ? event.data.json() : {}
  event.waitUntil(
    self.registration.showNotification(data.titulo || "Scheduleo", {
      body: data.mensaje || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url || "/" },
      vibrate: [200, 100, 200],
      requireInteraction: true
    })
  )
})

self.addEventListener("notificationclick", function(event) {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data.url || "/")
  )
})
