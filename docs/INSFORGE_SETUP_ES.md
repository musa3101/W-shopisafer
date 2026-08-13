# Guía de Configuración e Integración con InsForge Backend

## 1. Resumen Ejecutivo

Este proyecto está configurado con **InsForge** (`isafer-boutique`, URL base `https://i5jqzbx6.us-east.insforge.app`) como Backend-as-a-Service (BaaS) en PostgreSQL.

Permite dos tipos de acceso:

1. **Acceso de Clientas (Google OAuth)**:
   - Las clientas pueden iniciar sesión con un solo clic con Google (`insforge.auth.signInWithOAuth`).
   - **Registro Automático**: En cuanto una clienta nueva inicia sesión con Google, InsForge registra automáticamente su usuario, correo, foto de perfil y fecha de registro en la tabla de autenticación (`auth.users`) del backend en PostgreSQL.
   - Tienen acceso a su **Panel de Perfil y Pedidos**, donde ven su historial de compras, artículos comprados y el estado del envío.
2. **Panel de Control de Administración (La Dueña)**:
   - Acceso seguro mediante usuario/contraseña de administración (`admin` / `admin`).
   - Permite **modificar el precio y el stock de cada producto en tiempo real**.
   - Permite **crear nuevos productos** y eliminar productos descatalogados.
   - Permite **gestionar todos los pedidos**, ver totales de ventas y cambiar el estado de los pedidos (Pendiente, En proceso, Enviado, Entregado, Cancelado).

---

## 2. Estructura de Tablas en InsForge (PostgreSQL)

### Tabla `products`

- `id`: UUID (Clave primaria)
- `name`: VARCHAR / TEXT (Nombre del producto)
- `slug`: VARCHAR (Identificador URL único)
- `description`: TEXT (Descripción del producto)
- `price`: NUMERIC / FLOAT (Precio del producto en € o $)
- `stock`: INTEGER (Stock disponible)
- `images`: JSONB / TEXT[] (Imágenes del producto)
- `badge`: TEXT (Etiquetas como "Nuevo", "Popular", etc.)
- `is_featured`: BOOLEAN (Destacado)
- `created_at`: TIMESTAMP WITH TIMEZONE

### Tabla `orders`

- `id`: UUID (Clave primaria)
- `customer_name`: TEXT (Nombre del comprador)
- `customer_email`: TEXT (Email del comprador)
- `customer_phone`: TEXT (Teléfono opcional)
- `total_amount`: NUMERIC (Monto total del pedido)
- `status`: TEXT (`pending`, `processing`, `shipped`, `delivered`, `cancelled`)
- `items`: JSONB / TEXT (Lista de items: `[{ name, price, quantity }]`)
- `created_at`: TIMESTAMP WITH TIMEZONE

---

## 3. Inicio de Sesión con Google OAuth

El inicio de sesión se gestiona con `@insforge/sdk` a través del proveedor Google:

```typescript
const { data, error } = await insforge.auth.signInWithOAuth({
  provider: "google",
  redirectTo: window.location.origin,
});
```

En el Dashboard de InsForge (`https://i5jqzbx6.us-east.insforge.app`), en la sección **Authentication > OAuth Providers**, el proveedor Google está habilitado para gestionar el flujo OAuth de forma automática.

---

## 3.1. Políticas de Seguridad RLS (Row Level Security)

Para aplicar las políticas de seguridad en la base de datos de InsForge, ejecuta el archivo SQL ubicado en [`docs/sql/01_rls_security_policies.sql`](file:///Users/musa/Downloads/sopisafer/docs/sql/01_rls_security_policies.sql) en el **SQL Editor** del Dashboard de InsForge.

- **`favorites`**: Solo el usuario autenticado puede seleccionar, insertar y eliminar sus propios favoritos (`auth.uid() = user_id`).
- **`orders`**: Inserción pública permitida para checkouts de invitados. Lectura restringida únicamente al propietario del pedido (por coincidencia de email `auth.jwt() ->> 'email'`) o a administradores.
- **`products` y `categories`**: Lectura pública permitida para mostrar el catálogo en la web. Modificación y eliminación restringida a administradores (`role = 'admin'`).

---

## 4. Guía para la Entrega a la Dueña

Cuando le entregues la web a la dueña:

1. **Acceso al Panel de Control**:
   - En la parte superior derecha de la web (cabecera), haz clic en el icono de **Escudo / Panel de Administración** (<ShieldCheck />).
   - Usa las siguientes credenciales predeterminadas para ingresar:
     - **Usuario / Email:** `admin` (o `admin@rosseboutique.com`)
     - **Contraseña:** `admin` (o `admin123`)
2. **Cambiar Precios y Stock**:
   - Pestaña **Inventario & Precios**: verá la lista completa de productos.
   - Puede escribir el nuevo precio o cambiar las unidades de stock.
   - Al pulsar **Guardar**, el cambio queda actualizado inmediatamente en la base de datos de InsForge.
3. **Ver Pedidos**:
   - Pestaña **Gestión de Pedidos**: podrá ver todas las compras realizadas por las clientas en la web, el total en euros/dólares, y cambiar el estado del pedido a _Enviado_ o _Entregado_.
