# 🗺️ Roadmap de Desarrollo — Isafer Boutique 💖

## ✅ Tareas Completadas

- [x] **Foto de Perfil Oficial de Camila en Dashboard y Ajustes**: Avatar oficial (`camila-owner.jpg`) en el menú lateral y cabecera del panel de admin con opción interactiva para añadir, actualizar o restablecer la foto.
- [x] **Edición de Credenciales de Camila en Ajustes**: Formulario de modificación de Nombre, Correo Electrónico y Contraseña conectado con InsForge Auth y persistencia de sesión.
- [x] **Gestión Dinámica de Cupones & Banner VIP**: Creación de `couponsService.ts` y panel de administración para crear, activar, desactivar y eliminar cupones de descuento, así como personalizar el anuncio VIP de bienvenida de la tienda.
- [x] **Validación de Cupones en Tiempo Real en la Web**: Integración de la bolsa de compras con la configuración de cupones para aplicar automáticamente los % OFF a los pedidos.
- [x] **Corrección de GitHub Action Keep-Alive**: Actualización de la URL de endpoint y token Bearer en `.github/workflows/keep-alive.yml` para obtener respuestas HTTP 200 OK.
- [x] **Imágenes de Productos 100% Limpias en Colecciones Destacadas**: Eliminación total de badges o etiquetas flotantes sobre las fotos de prendas en el catálogo.
- [x] **Silueta de Pin de Ubicación en Rosa Chic**: Marca de agua del pin de Google Maps en la sección *Visítanos en Brooklyn* en tono rosado tenue elegante.
- [x] **Rediseño Compacto de Tarjetas de Contacto en Móvil**: Sustitución de los 3 cuadros gigantes apilados por filas horizontales estilizadas y ultraligeras.
- [x] **Optimización de Header Móvil en "Nuestra Historia"**: Flecha `←` sola en móvil e integración del logotipo oficial transparente.
- [x] **Relocalización del Perfil de Usuario en Header Móvil**: Perfil en menú hamburguesa y logotipo central agrandado.
- [x] **Suite de Pruebas E2E**: 26 de 26 pruebas pasadas con 100% de éxito.

---

## 🔄 Tareas en Progreso

- [ ] Monitoreo en producción del tiempo de respuesta del despliegue en Cloudflare Workers / Pages.
- [ ] Monitoreo continuo de la base de datos PostgreSQL de InsForge.

---

## 📌 Próximas Mejoras Prioritarias

- [ ] Migrar las imágenes JPG antiguas del catálogo (`IMG_48xx.jpg`) a formato WebP para acelerar los tiempos de carga en móviles.
- [ ] Configurar correo real definitivo de Camila para la entrega final del proyecto.
- [ ] Configurar `VITE_DEFAULT_STRIPE_PRICE_ID` con la clave definitiva de Stripe en producción.
