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
  - [x] Creada barra de cabecera rígida superior con fondo blanco puro y línea divisora.
  - [x] Aumentado un 15% el tamaño de logotipo (`scale-110`) en el header.
  - [x] Cambiado fondo general de panel a un tono crema nude muy suave (`bg-[#fdf9f7]`).
  - [x] Encapsulada la parte inferior del menú (VIP, redes oficiales, selector idioma) en un footer de menú diferenciado con fondo ligeramente más oscuro (`bg-[#f5ebe7]`) y borde superior.
  - [x] Reorganizado el listado de secciones eliminando Gas Pimienta de nivel principal.
  - [x] Modificado enlace de Contacto para scroll a `#visitanos`.
- [x] **Optimización del Hero Móvil**:
  - [x] Reducidos los degradados del fondo oscuros en móvil para potenciar la visualización de fotos.
  - [x] Achicada la tipografía de títulos y compactados los espacios verticales y paddings del texto.
  - [x] Encogido el botón CTA principal "EXPLORAR COLECCIÓN" para que no interfiera con las imágenes.
- [x] **Rediseño de Bolsa / Carrito de Compras**:
  - [x] Eliminada la caja oscura del carrito, adoptando un Slide-over Drawer claro de color crema suave/blanco elegante (`bg-[#fffcfd]`) y bordes suaves de color rosa (`border-rose-100/50`).
  - [x] Cabecera limpia con el título "Tu Bolsa" y el contador de ítems entre paréntesis.
  - [x] Removida la cruz rosa agresiva por un aspa minimalista fina gris.
  - [x] Rediseñado el Estado Vacío con un icono grande y suave, texto limpio y botón "Explorar Colección" para cerrar el carrito.
  - [x] Creado diseño de tarjetas de productos más refinado (imágenes con borde rosa suave, talla/color y un selector de cantidad discreto y compacto).
  - [x] Pie de carrito fijo con subtotal visible, botón de Checkout destacado en fucsia premium (`#ff007f`) y botón alternativo de WhatsApp.
- [x] **Rediseño del Footer (Pie de Página)**:
  - [x] Fondo cambiado a un negro mate boutique de lujo (`#111111`) y borde superior sutil (`border-zinc-800/60`).
  - [x] Títulos en blanco de alto contraste (`text-zinc-100`) y textos secundarios altamente legibles en gris (`text-zinc-400`).
  - [x] Organizado en bloques limpios: Info & Redes (con el logotipo circular rosa de aro de neón oficial `IsaferLogo variant="footer" size="lg"`), Colecciones de ropa, y Soporte al Cliente con scroll a la ubicación (`#visitanos`).
  - [x] Insignias de métodos de pago rediseñadas con un formato uniforme rectangular y fondo carbón minimalista.
  - [x] Créditos del subfooter actualizados destacando elegantemente la autoría **"Creado por MYNEXT"** en fucsia vibrante (`#ff007f`) y enlaces de políticas limpios.

## 🔄 Tareas en Progreso
- [ ] Monitorización del Keep-Alive y comportamiento del Free Tier de Insforge.
- [ ] Monitorización continua de ventas y métricas de Stripe Checkout.

## 📌 Próximas Mejoras Prioritarias
- [ ] Notificaciones push PWA nativas en móviles cuando entre una venta.
- [ ] Recordatorios automáticos de confirmación por email para pedidos pendientes.
