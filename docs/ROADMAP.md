# 🗺️ Roadmap de Desarrollo — Isafer Boutique 💖

## ✅ Tareas Completadas

- [x] **Selector de Sección / Categoría Web en Admin (`ProductCreator`)**: Selector interactivo para asignar directamente la sección (`Tops & Sets`, `Vestidos`, `Licras & Leggings`, `Bodys & Corsets`, `Accesorios & Glam`) al crear una prenda desde el panel de Camila.
- [x] **Sincronización Total Admin ↔ PostgreSQL ↔ Web**: Eliminación del almacenamiento dual en `localStorage`. Todas las prendas creadas o modificadas por Camila van directo a PostgreSQL y se leen en vivo en la Web.
- [x] **TanStack Loader de Catálogo**: Eliminación del catálogo fantasma hardcoded en `index.tsx`. Carga precargada directa de prendas desde PostgreSQL.
- [x] **Autenticación Admin JWT Real**: Configuración de `admin@isaferboutique.com` con permiso `is_project_admin = true` en InsForge. Credenciales `admin` / `admin` sin fallbacks falsos.
- [x] **Diagnóstico PostgreSQL en Vivo (`/admin/ajustes`)**: Ping ultraligero directo a InsForge con estado CONECTADO y latencia real.
- [x] **Suite de Pruebas E2E (Playwright + TestSuite Cross-Sync)**: 26 de 26 pruebas pasadas con 100% de éxito.
- [x] **Formulario Completo de Datos de Envío (`CheckoutShippingModal`)**: Modal responsivo para capturar Nombre, Apellidos, Email, Teléfono WhatsApp, Dirección completa y Notas de entrega.
- [x] **Ficha de Cliente & Envío en Panel de Camila (`/admin/pedidos`)**: Visualización en PostgreSQL con Nombre, Email, Teléfono con botón WhatsApp y dirección formateada.
- [x] **Incentivo VIP de Inicio de Sesión en la Cesta**: Banner destacado en la bolsa para invitados (`!user`) con beneficio de **10% OFF** automático (`VIP10`).
- [x] **Rediseño Bento Grid del Panel Admin (`/admin`)**: Dashboard moderno con Bento Grids, accesos rápidos, métricas en tiempo real.
- [x] **Despliegue a Cloudflare Pages**: Sincronización continua y verificación de HTTP 200 OK.

---

## 🔄 Tareas en Progreso

- [ ] Monitoreo en producción del tiempo de respuesta del despliegue en Cloudflare Workers / Pages.
- [ ] Monitoreo continuo de la base de datos PostgreSQL de InsForge.

---

## 📌 Próximas Mejoras Prioritarias

- [ ] Migrar las imágenes JPG antiguas del catálogo (`IMG_48xx.jpg`) a formato WebP para acelerar los tiempos de carga en móviles.
- [ ] Configurar correo real definitivo de Camila para la entrega final del proyecto.
- [ ] Configurar `VITE_DEFAULT_STRIPE_PRICE_ID` con la clave definitiva de Stripe en producción.
