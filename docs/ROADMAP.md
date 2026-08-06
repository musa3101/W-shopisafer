# 🗺️ Roadmap de Desarrollo — Isafer Boutique 💖

## ✅ Tareas Completadas
- [x] Verificación de TypeScript con CLI `npx tsc --noEmit` (0 errores).
- [x] **Panel de Administración Protegido `/admin`**:
  - [x] Creadas rutas independientes para login, resumen, pedidos, catálogo y ajustes.
  - [x] Cambiado diseño oscuro a una UI suiza minimalista blanca y gris, limpia y profesional.
  - [x] Modificados los accesos en la web para navegar directamente a la ruta `/admin`.
- [x] **Integración de Gestión Real**:
  - [x] Cargados y vinculados pedidos e inventario real a través de `OrderManager` y `StockManager`.
  - [x] Funcionalidades de modificación de precios, stock, y cambio de estado de pedidos activas.
  - [x] Creada sección de Ajustes con diagnóstico de latencia de base de datos e interruptor de sonido.
- [x] **Monitoreo & Keep-Alive de Base de Datos**:
  - [x] Creado endpoint ultraligero `/api/health` para pings de diagnóstico.
  - [x] Configurado Cron Trigger en wrangler.jsonc y scheduled handler en Cloudflare cada 10 min para mantener InsForge activo.
- [x] **Rediseño del Menú Móvil Público**:
  - [x] Aumentado tamaño de logotipo y añadida línea de separación sutil.
  - [x] Reorganizado el listado de secciones eliminando Gas Pimienta.
  - [x] Rediseñado botón de Cuenta VIP con estilo boutique fucsia premium.
  - [x] Simplificadas tarjetas de redes sociales por una fila minimalista de enlaces oficiales de perfiles.
  - [x] Modificado enlace de Contacto para que apunte a la sección física (`#visitanos`) y removido lo relativo a FAQ.
- [x] **Optimización del Hero Móvil**:
  - [x] Reducidos los degradados del fondo oscuros en móvil para potenciar la visualización de fotos.
  - [x] Achicada la tipografía de títulos y compactados los espacios verticales y paddings del texto.
  - [x] Encogido el botón CTA principal "EXPLORAR COLECCIÓN" para que no interfiera con las imágenes.

## 🔄 Tareas en Progreso
- [ ] Monitorización del Keep-Alive y comportamiento del Free Tier de Insforge.
- [ ] Monitorización continua de ventas y métricas de Stripe Checkout.

## 📌 Próximas Mejoras Prioritarias
- [ ] Notificaciones push PWA nativas en móviles cuando entre una venta.
- [ ] Recordatorios automáticos de confirmación por email para pedidos pendientes.
