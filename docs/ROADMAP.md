# 🗺️ Roadmap de Desarrollo — Isafer Boutique 💖

## ✅ Tareas Completadas

- [x] **Quick-Add Inline Estilo Pull&Bear (Móvil)**: Selector de tallas in-situ sobre la tarjeta del producto al pulsar "Añadir", sin abrir modales ni interrumpir la navegación.
- [x] **Modal Responsivo Optimizado (Desktop/Tablet)**: `ProductDetailModal` ajustado con `max-h-[90dvh]` y scroll interno suave.
- [x] **Corrección Visual del Logo en Footer**: Fondo `#f8f7f2` unificado y zoom de corte (`scale-[1.45]`) para eliminar los bordes blancos de la imagen JPEG.
- [x] **Fix de Tipografía Responsiva en Loader**: Texto "ISÀFER BOUTIQUE" adaptativo con `clamp()` para evitar recortes en pantallas pequeñas.
- [x] **Auditoría E2E & Playwright MCP**: Suite completa de pruebas ejecutada con 100% de éxito.
- [x] **Traducción 100% Completa (i18n)**: Español e Inglés funcionando sin claves faltantes.
- [x] **Layout 100% Responsive**: 0px de scrollbar horizontal en Móvil, Tablet y Escritorio.
- [x] **Verificación Estricta de TypeScript**: `npm run build` ejecutado con **0 errores**.
- [x] **Despliegue a Cloudflare Pages**: Desplegado en `https://isaferboutique.pages.dev` (HTTP 200 OK).

---

## 🔄 Tareas en Progreso

- [ ] Monitoreo en producción del tiempo de respuesta del despliegue en Cloudflare Workers / Pages.
- [ ] Monitoreo continuo de la base de datos PostgreSQL de InsForge.

---

## 📌 Próximas Mejoras Prioritarias

- [ ] Migrar las imágenes JPG antiguas del catálogo (`IMG_48xx.jpg`) a formato WebP para acelerar los tiempos de carga en móviles.
- [ ] Configurar correos automáticos complementarios para la recuperación de carritos abandonados tras 2 horas de inactividad de la clienta.
- [ ] Configurar `VITE_DEFAULT_STRIPE_PRICE_ID` con la clave definitiva de Stripe en producción.
