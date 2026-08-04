# 🗺️ Roadmap — Isafer Boutique Web Demo

## 🟢 Tareas Completadas
- [x] Análisis del material de referencia de Instagram y TikTok.
- [x] Definición e implementación de branding Barbie Luxe (Hot Pink + Dorado Luxe).
- [x] Estructuración del proyecto TanStack Start + Vite en la rama `dev`.
- [x] Solución de compilación e integración de plugins en `vite.config.ts` para Cloudflare.
- [x] Configuración de `wrangler.jsonc` para URL sencilla: `https://isafer.mynextbymusa.workers.dev`.
- [x] Subida del código al repositorio remoto GitHub (`musa3101/W-shopisafer`).
- [x] Implementación de internacionalización (i18n) aplicando skill `i18nstack` (Inglés EE. UU. por defecto y Español seleccionable).
- [x] Optimización de diseño responsivo de las Colecciones Destacadas (móvil y tablet en 2 columnas, tarjetas compactas minimalistas y limitador de items por CSS).
- [x] Subida de las 15 fotos reales del mini catálogo a InsForge Storage (bucket público `products`).
- [x] Inserción de los 15 productos reales en la base de datos PostgreSQL de InsForge con precios ajustados ($30 - $90 USD).
- [x] Conexión dinámica del catálogo en la web con InsForge y sincronización en tiempo real con el Panel de Administración de la Dueña.
- [x] **Integrar pasarela de pago Stripe**: Implementación del checkout para pagos con tarjeta de crédito/débito en la bolsa de compras y edición de IDs de precio en el Panel de Administración.
- [x] **Implementación de webhooks de Stripe**: Edge Function `stripe-webhook` creada y desplegada en InsForge para automatizar la actualización de pedidos y el envío de correos de confirmación en estilo Barbie Luxe.
- [x] **Rediseño del Panel de Camila**: Personalización exclusiva del modal de administración, unificación de moneda a dólares ($ USD), Bento Grid de métricas con degradados y tags de método de pago (Stripe vs WhatsApp).
- [x] **Optimización Responsiva y Menú Móvil**: Hibridación del modal de Camila (tabla/tarjetas) y rediseño de alta costura del Drawer lateral móvil con iconos de Lucide, avatar dinámico de perfil de usuario y cierre minimalista.
- [x] **Sistema de Favoritos Híbrido Estilo Pull&Bear**: Corazones animados táctiles (cambio a rosa Barbie con pulso), tabla de favoritos en base de datos PostgreSQL, sincronización automática al loguearse, modal Pull&Bear de login para invitados, y panel lateral (Wishlist) en Navbar para adición rápida.
- [x] **Banner de Cookies Estilo Pull&Bear / Bershka**: Banner regulatorio responsivo en la base de la pantalla con aparición temporizada a 1.2 segundos, tres botones corporativos e integración de persistencia en `LocalStorage`.
- [x] **Banner de Ubicación e Idioma Dinámico (Pull&Bear Style)**: Banner regulatorio responsivo flotante en la esquina inferior de la pantalla. Detecta automáticamente la preferencia de idioma del navegador del cliente y propone cambiar la ubicación e idioma (Español <-> Inglés) con almacenamiento persistente en `LocalStorage`.
- [x] **Envío Automático de Correos de Pedido (Gmail)**: Sincronización del envío de confirmaciones detalladas al email real del cliente tanto para pagos aprobados con tarjeta (mediante el Webhook de Stripe en backend) como para pedidos solicitados por WhatsApp (a través del frontend integrado).
- [x] **Notificación por WhatsApp de Nuevos Pedidos a la Dueña**: Integrada la API de CallMeBot en el webhook de Stripe para notificar automáticamente al número de Camila (`19296772514`) cuando se completa una compra con tarjeta en la web.
- [x] **Keep-Alive de InsForge en segundo plano**: Creado el workflow de GitHub Actions `.github/workflows/keep-alive.yml` que hace un ping automático por API cada 30 minutos de forma 100% gratuita y externa para mantener el servidor siempre despierto y rápido.

## 🟡 Tareas en Progreso
- [ ] Verificación de despliegue activo en Cloudflare Pages / Workers (`https://isafer.mynextbymusa.workers.dev`).

## 🔵 Próximas Mejoras Prioritarias
- [ ] Incorporación de RLS avanzado en la base de datos de InsForge para control de accesos de clientes.
