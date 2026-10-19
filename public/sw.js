import { precacheAndRoute } from 'workbox-precaching'

precacheAndRoute(self.__WB_MANIFEST)

// Aviso de actualización: la página pide activar la versión nueva
// (botón "Actualizar") y luego recarga.
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting()
})

// Al activar, tomar control de las páginas abiertas (si no, la página
// vieja nunca se entera de la actualización ni recarga).
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', event => {
  const data = event.data?.json() ?? { title: 'Katt', body: '' }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: data.url ?? '/' },
      vibrate: [200, 100, 200],
      requireInteraction: true,
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (('url' in client) && client.url === url && 'focus' in client) return client.focus()
      }
      return clients.openWindow(url)
    })
  )
})
