# Estado de la Sesión — Isafer Boutique

## 📅 Fecha: 4 de Agosto, 2026

### 📝 Qué se ha hecho hoy
1. **Subida del Catálogo Real a InsForge**:
   - Subidas las 15 imágenes de prendas reales al bucket público `products` en **InsForge Storage**.
   - Sembrado en PostgreSQL los 15 productos reales con nombres, descripciones Barbie Luxe y precios en dólares.
2. **Integración de Pasarela de Pago Stripe**:
   - Agregada la columna `stripe_price_id` a la tabla `products` en PostgreSQL de InsForge.
   - Implementado el flujo de Stripe Checkout en la bolsa de compras del frontend.
3. **Automatización con Webhooks y Edge Functions**:
   - Añadida la columna `stripe_session_id` a la tabla `orders` en PostgreSQL de InsForge.
   - Desarrollada y desplegada la Edge Function `stripe-webhook` (`https://i5jqzbx6.function2.insforge.app`) para automatizar el cambio de estado del pedido a `processing` y enviar correos de confirmación en tiempo real.
4. **Rediseño Premium del Panel de Camila**:
   - Título personalizado como *"Panel de Camila · Isafer Boutique 💖"* con un saludo exclusivo para ella.
   - Corregidas las divisas de euros (`€`) a dólares (**`$ USD`**).
   - Bento Grid responsivo de métricas con degradados elegantes y efectos hover.
   - Añadidos badges de método de pago (`💳 Tarjeta (Stripe)` y `💬 WhatsApp`) y estados de pedido en color.
5. **Optimización Responsiva para Móvil (Full Responsive)**:
   - Modificado el contenedor del panel de administración (`DialogContent`) para soportar `w-[96vw]` y paddings adaptativos, evitando desbordamientos laterales.
   - Desarrollada una **vista híbrida de productos** (tarjetas para móviles, tabla para ordenadores).
6. **Rediseño Completo del Menú Lateral Móvil (Drawer)**:
   - **Botón de Cierre Minimalista**: Ocultado el botón rosa redondo desalineado; reemplazado por una cruz minimalista transparente.
   - **Enlaces Editoriales**: Quitados los signos `+` de acordeón e incorporados iconos de Lucide y flechas sutiles (`ChevronRight`).
   - **Tarjeta VIP de Perfil de Usuario**: Creado un perfil interactivo en el menú móvil con un avatar de iniciales de usuario, rol destacado (Administradora 🛡️ o Cliente 👤) y flecha indicadora.
7. **Sistema de Favoritos (Wishlist) Estilo Pull&Bear / Bershka**:
   - **Base de Datos**: Creada la tabla `favorites` vinculando `user_id` y `product_id`.
   - **Servicios**: Creado `favoritesService.ts` en InsForge para obtener, añadir, eliminar y sincronizar favoritos en caliente al iniciar sesión.
   - **Corazones Animados**: Añadido un botón de corazón en cada producto. Por defecto, es gris fino/transparente (estilo Pull&Bear). Al marcarlo, tiene un **efecto bounce táctil** y se rellena de **rosa Barbie animado** (`animate-pulse`).
   - **Modal Pull&Bear**: Al pulsar el corazón sin sesión, se abre un diálogo que te permite continuar como invitado (guardando en `LocalStorage`) o acceder/crear cuenta.
   - **Cajón de Favoritos**: Agregado un corazón con contador en el Navbar superior para abrir la Wishlist y añadir prendas directamente a la Bolsa.
8. **Banner de Consentimiento de Cookies (Pull&Bear Style)**:
   - **Aparición Inteligente**: Si no hay decisión registrada en el navegador, el banner aparece automáticamente con deslizamiento desde abajo tras **1.2 segundos** de carga.
   - **Los 3 Botones Corporativos**: Configuración de Cookies, Rechazar Cookies, y Aceptar Cookies.
   - **Persistencia**: Al pulsar cualquier botón, el consentimiento se guarda en `LocalStorage` (`isafer_cookies_consent`) y se oculta el banner inmediatamente.
9. **Banner de Ubicación e Idioma Dinámico (Pull&Bear Style)**:
   - **Detección Automática**: Analiza el idioma del navegador (`navigator.language`). Si la web está en inglés pero el cliente prefiere español (es de España/Latam), el banner se desliza en la esquina inferior izquierda tras **3.5 segundos** (dando espacio al de cookies). Si la web está en español pero prefiere inglés, sugiere cambiar a inglés.
   - **Interactividad**: Permite cambiar la ubicación o el idioma con un clic. Botones responsivos "Sí" y "No" con almacenamiento persistente en `LocalStorage` (`isafer_geo_consent`).
10. **Confirmación y Registro de Pedidos por Email (Gmail)**:
    - **Compras por Stripe**: El webhook de Stripe envía un correo en tiempo real a la dirección de correo real del cliente proporcionada en la pantalla de pago de Stripe.
    - **Pedidos por WhatsApp**: Si la clienta tiene sesión iniciada y hace un pedido por WhatsApp, recibe automáticamente un correo detallando su selección de prendas, importes y enlace directo de WhatsApp.
11. **Alertas por WhatsApp a la Dueña Camila**:
    - **Notificación de Compras en Stripe**: Cuando el webhook procesa un pago con éxito, realiza una llamada a CallMeBot para enviar un WhatsApp automático al móvil de Camila (`19296772514`) indicando el código de orden, nombre del cliente y total de la compra.

### 📂 Archivos modificados
- `src/services/insforgeService.ts`
- `src/services/favoritesService.ts`
- `src/components/AdminDashboardModal.tsx`
- `src/routes/index.tsx`
- `functions/stripe-webhook.ts`
- `docs/SESSION_LATEST_ES.md`
- `docs/ROADMAP.md`

### 📌 Qué queda pendiente para la PRÓXIMA SESIÓN
- ☁️ **Verificación de despliegue**: Comprobar la URL activa en Cloudflare Workers (`https://isafer.mynextbymusa.workers.dev`).
