# 🗺️ Roadmap de Desarrollo — Isafer Boutique 💖

## ✅ Tareas Completadas

- [x] **Formulario Completo de Datos de Envío (`CheckoutShippingModal`)**: Modal responsivo para capturar Nombre, Apellidos, Email, Teléfono WhatsApp, Dirección completa y Notas de entrega antes de pagar con Stripe o pedir por WhatsApp.
- [x] **Ficha de Cliente & Envío en Panel de Camila (`/admin/pedidos`)**: Visualización estructurada en PostgreSQL con Nombre, Email, Teléfono con botón WhatsApp y dirección formateada para paquetería.
- [x] **Incentivo VIP de Inicio de Sesión en la Cesta**: Banner destacado en la bolsa para invitados (`!user`) con beneficio de **10% OFF** automático (`VIP10`) y sincronización de bolsa.
- [x] **Rediseño Bento Grid del Panel Admin (`/admin`)**: Dashboard moderno con Bento Grids, accesos rápidos, métricas en tiempo real y vista responsive.
- [x] **Limpieza Prístina de la Base de Datos**: Purga de órdenes de prueba antiguas conservando las 15 prendas reales del catálogo en InsForge PostgreSQL.
- [x] **Quick-Add Inline Estilo Pull&Bear (Móvil)**: Selector de tallas in-situ sobre la tarjeta del producto al pulsar "Añadir", sin abrir modales ni interrumpir la navegación.
- [x] **Auditoría E2E & Playwright MCP**: Suite completa de pruebas ejecutada con 100% de éxito.
- [x] **Traducción 100% Completa (i18n)**: Español e Inglés funcionando sin claves faltantes.
- [x] **Layout 100% Responsive**: 0px de scrollbar horizontal en Móvil, Tablet y Escritorio.
- [x] **Verificación Estricta de TypeScript**: `npm run build` ejecutado con **0 errores**.
- [x] **Despliegue a Cloudflare Pages**: Sincronización continua y verificación de HTTP 200 OK.

---

## 🔄 Tareas en Progreso

- [ ] Monitoreo en producción del tiempo de respuesta del despliegue en Cloudflare Workers / Pages.
- [ ] Monitoreo continuo de la base de datos PostgreSQL de InsForge.

---

## 📌 Próximas Mejoras Prioritarias

- [ ] Migrar las imágenes JPG antiguas del catálogo (`IMG_48xx.jpg`) a formato WebP para acelerar los tiempos de carga en móviles.
- [ ] Configurar correos automáticos complementarios para la recuperación de carritos abandonados tras 2 horas de inactividad de la clienta.
- [ ] Configurar `VITE_DEFAULT_STRIPE_PRICE_ID` con la clave definitiva de Stripe en producción.
