# 🗺️ Roadmap de Desarrollo — Isafer Boutique 💖

## ✅ Tareas Completadas

- [x] **Verificación Estricta de TypeScript**: `npx tsc --noEmit` ejecutado con **0 errores**.
- [x] **Compilación y SSR**: Build exitoso de producción (`npm run build`).
- [x] **Stripe Price ID 100% Opcional**:
  - Camila ya no necesita copiar manualmente el ID de precio de Stripe para cada prenda.
  - La pasarela asigna un cobro automático por defecto en caso de no especificarse.
  - Modificados `ProductCreator.tsx`, `StockManager.tsx` e `index.tsx`.
- [x] **Auditorías Técnicas Automatizadas**:
  - Script `scripts/audit_dual_perspective.js`: 15/15 prendas verificadas en base de datos.
  - Script `scripts/audit_web.js`: Respuestas HTTP 200 en todas las páginas e imágenes del catálogo.
  - Script `scripts/audit_final_ts.ts`: 18/18 pruebas E2E superadas (100%).
- [x] **Auditoría Visual Completa con Chrome CDP**:
  - Script `scripts/audit_full_visual.js` ejecutado navegando por 22 componentes y generando informe en `docs/VISUAL_AUDIT_REPORT.md`.
- [x] **PWA & Manifiestos**:
  - Creado `public/manifest.json` para clientes y `public/admin-manifest.json` para el panel de Camila.
  - Registrado Service Worker `sw.js` para notificaciones Push PWA en el panel de administración.
- [x] **Notificaciones Push PWA Nativas**:
  - Tabla `push_subscriptions` en Postgres de InsForge.
  - Integración en Webhook de Stripe para alertas al completarse un pago.
- [x] **Recordatorios de Pedidos Pendientes**:
  - Edge Function `send-pending-reminders.ts` y Schedule diario en InsForge.
- [x] **Rediseño de Menú Móvil, Carrito Drawer y Footer**:
  - Menú limpio en tono crema nude, Carrito Drawer blanco elegante con fucsia boutique y footer negro mate con icono SVG de TikTok y WhatsApp.

---

## 🔄 Tareas en Progreso

- [ ] Monitoreo en producción de la entrega de alertas Push PWA nativas en móviles.
- [ ] Monitoreo continuo del uptime y respuesta de la base de datos PostgreSQL de InsForge.

---

## 📌 Próximas Mejoras Prioritarias

- [ ] Migrar las imágenes JPG antiguas del catálogo (`IMG_48xx.jpg`) a formato WebP para acelerar los tiempos de carga en móviles.
- [ ] Configurar correos automáticos complementarios para la recuperación de carritos abandonados tras 2 horas de inactividad de la clienta.
- [ ] Instalar TestSprite CLI localmente para ejecución de tests E2E automatizados desde la terminal.
- [ ] Configurar `VITE_DEFAULT_STRIPE_PRICE_ID` con la clave definitiva de Stripe en producción.
