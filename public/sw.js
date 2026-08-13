// Service Worker para notificaciones Push PWA de Isafer Boutique
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {
    title: "Isafer Boutique 💖",
    body: "¡Se ha registrado una actualización en el sistema!",
    url: "/admin/pedidos",
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      // Si la carga útil no es JSON, la tomamos como texto plano
      data = {
        title: "Isafer Boutique 💖",
        body: event.data.text(),
        url: "/admin/pedidos",
      };
    }
  }

  const options = {
    body: data.body,
    icon: "/favicon.png",
    badge: "/favicon.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/admin/pedidos",
    },
    actions: [{ action: "open", title: "Ver Pedido 🛍️" }],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/admin/pedidos";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Si ya hay una pestaña abierta en la app, la enfocamos y navegamos
        for (const client of clientList) {
          if (client.url.includes("/admin") && "focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Si no, abrimos una nueva pestaña
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      }),
  );
});
