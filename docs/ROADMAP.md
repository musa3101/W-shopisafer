# 🗺️ Roadmap de Desarrollo — Isafer Boutique 💖

## ✅ Tareas Completadas

- [x] **Eliminación Total de Autenticación Admin por localStorage**: `/admin` y `useAuth.ts` dependen exclusivamente de la sesión válida y rol de InsForge Auth.
- [x] **Claves de InsForge Protegidas en Variables de Entorno**: `src/lib/insforge.ts` consume `VITE_INSFORGE_URL` y `VITE_INSFORGE_ANON_KEY` sin fallbacks hardcodeados en código.
- [x] **Validación Estricta de Newsletter & Email**: `subscribeToNewsletter` en `insforgeService.ts` valida formato de correo y no simula éxito ante errores de base de datos.
- [x] **Sincronización del Setup Maestro & CDP Chrome**: Integración de `setup.sh` de `setup-musa-mynext` e instalación de `puppeteer` en `devDependencies`.
- [x] **Optimización de Bundling & Code-Splitting**: `vite.config.ts` configurado con `manualChunks` dividiendo librerías pesadas (`vendor-charts`, `vendor-radix`, `vendor-icons`).
- [x] **Limpieza Masiva de Lint & TypeScript**: Formateo Prettier en todo el proyecto y reemplazo de tipos `any` por interfaces concretas.
- [x] **Unificación de Idioma en la Boutique**: Idioma por defecto configurado en español neutro elegante (`es`).
- [x] **Foto de Perfil Oficial de Camila en Dashboard y Ajustes**: Avatar oficial (`camila-owner.jpg`) en el menú lateral y cabecera del panel de admin.
- [x] **Edición de Credenciales de Camila en Ajustes**: Formulario de modificación de Nombre, Correo y Contraseña conectado con InsForge Auth.
- [x] **Gestión Dinámica de Cupones & Banner VIP**: `couponsService.ts` y panel de administración para cupones de descuento y banner VIP.
- [x] **Suite de Pruebas E2E**: Integración continua con Playwright.

---

## 🔄 Tareas en Progreso

- [ ] Monitoreo en producción del tiempo de respuesta del despliegue en Cloudflare Workers / Pages.
- [ ] Monitoreo continuo de la base de datos PostgreSQL de InsForge.

---

## 📌 Próximas Mejoras Prioritarias

- [ ] Migrar las imágenes JPG antiguas del catálogo (`IMG_48xx.jpg`) a formato WebP para acelerar los tiempos de carga en móviles.
- [ ] Configurar correo real definitivo de Camila para la entrega final del proyecto.
- [ ] Configurar `VITE_DEFAULT_STRIPE_PRICE_ID` con la clave definitiva de Stripe en producción.
