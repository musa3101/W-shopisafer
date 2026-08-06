# 🗺️ Roadmap de Desarrollo — Isafer Boutique 💖

## ✅ Tareas Completadas
- [x] Verificación de TypeScript con CLI `npx tsc --noEmit` (0 errores).
- [x] Compilación exitosa del bundle de producción SSR (`npm run build`).
- [x] **Notificaciones Push PWA nativas en móviles**:
  - [x] Creada la tabla `push_subscriptions` en Postgres de InsForge.
  - [x] Desarrollado el Service Worker de fondo `sw.js` para recibir e interceptar alertas.
  - [x] Registrado el Service Worker automáticamente en el layout de administración `/admin`.
  - [x] Desarrollado el switch interactivo en **Ajustes** para solicitar permisos de notificación y suscribir el navegador.
  - [x] Modificado el webhook de Stripe para buscar dispositivos suscritos y disparar el push cifrado nativo al completarse un pago, con limpieza de tokens obsoletos (410).
- [x] **Recordatorios automatizados por email para pedidos pendientes**:
  - [x] Añadida la columna `reminder_sent` a la tabla `orders` en Postgres.
  - [x] Desarrollada la Edge Function `send-pending-reminders.ts` que filtra pedidos pendientes y envía correos HTML recordatorios.
  - [x] Programado el Cron (Schedule) diario a las 9 AM en la plataforma InsForge para ejecutar la función de recordatorios de forma automática.
- [x] **Monitoreo continuo de base de datos con Keep-Alive**:
  - [x] Creada la tabla `database_health_logs` en Postgres.
  - [x] Modificado el Cron Keep-Alive de 10 min en `src/server.ts` para realizar un select a la tabla `products`, medir la latencia e insertarlo como log.
  - [x] Diseñada una tira de pings tipo commits de GitHub e indicadores de latencia media y Uptime (%) históricos en el panel de **Ajustes**.
- [x] **Centralización y número de pruebas**:
  - [x] Creado `src/lib/constants.ts` con el número de pruebas de España `346673109486` y la clave pública VAPID.
  - [x] Vinculado dinámicamente en index, about y en la administración de Camila.
  - [x] Configurada la variable `OWNER_PHONE` en variables de entorno locales y secretos en la nube de InsForge.
- [x] **Panel de Administración Protegido `/admin`**:
  - [x] Creadas rutas independientes para login, resumen, pedidos, catálogo y ajustes.
  - [x] Cambiado diseño oscuro a una UI suiza minimalista blanca y gris, limpia y profesional.
  - [x] Modificados los accesos en la web para navegar directamente a la ruta `/admin`.
- [x] **Integración de Gestión Real**:
  - [x] Cargados y vinculados pedidos e inventario real a través de `OrderManager` y `StockManager`.
  - [x] Funcionalidades de modificación de precios, stock, y cambio de estado de pedidos activas.
  - [x] Creada sección de Ajustes con diagnóstico de latencia de base de datos e interruptor de sonido.
- [x] **Rediseño del Menú Móvil Público**:
  - [x] Creada barra de cabecera rígida superior con fondo blanco puro y logotipo ampliado 15%.
  - [x] Cambiado fondo general de panel a un tono crema nude muy suave (`bg-[#fdf9f7]`).
  - [x] Encapsulada la parte inferior del menú (VIP, redes oficiales, selector idioma) en un bloque diferenciado con fondo ligeramente más oscuro (`bg-[#f5ebe7]`) y borde superior.
- [x] **Optimización del Hero Móvil**:
  - [x] Reducidos los degradados del fondo oscuros en móvil para potenciar la visualización de fotos.
  - [x] Achicada la tipografía de títulos y compactados los espacios verticales y paddings del botón CTA.
- [x] **Rediseño de Bolsa / Carrito de Compras**:
  - [x] Adoptado un Slide-over Drawer claro de color crema suave/blanco elegante (`bg-[#fffcfd]`) y bordes suaves de color rosa.
  - [x] Cabecera limpia con el título "Tu Bolsa" y el contador de ítems entre paréntesis, evitando solapamiento visual con la 'X' de cierre.
  - [x] Pie de carrito fijo con subtotal visible, botón de Checkout destacado en fucsia premium (`#ff007f`) y botón alternativo de WhatsApp.
- [x] **Rediseño del Footer (Pie de Página)**:
  - [x] Fondo cambiado a un negro mate boutique de lujo (`#111111`) y borde superior sutil.
  - [x] Títulos en blanco de alto contraste (`text-zinc-100`) y textos secundarios en gris.
  - [x] Enlace de autoría **"Creado por MYNEXT"** destacado elegantemente en fucsia vibrante (`#ff007f`).

## 🔄 Tareas en Progreso
- [ ] Validación en producción de la entrega de alertas Push PWA nativas y WhatsApp de CallMeBot.
- [ ] Monitoreo continuo del uptime y respuesta de la base de datos PostgreSQL de InsForge en el plan de hosting actual.

## 📌 Próximas Mejoras Prioritarias
- [ ] Habilitar soporte para formatos de imagen optimizados (como WebP) en el catálogo de productos para acelerar los tiempos de carga en móviles.
- [ ] Configurar correos automáticos complementarios para la recuperación de carritos abandonados tras 2 horas de inactividad de la clienta.
