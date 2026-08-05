-- Migration 01: Configuración de Políticas de Seguridad RLS (Row Level Security)
-- Isafer Boutique - InsForge Backend

-------------------------------------------------------
-- 1. TABLA: favorites
-------------------------------------------------------
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow user to select own favorites" ON favorites;
DROP POLICY IF EXISTS "Allow user to insert own favorites" ON favorites;
DROP POLICY IF EXISTS "Allow user to delete own favorites" ON favorites;

-- Lectura sólo de los favoritos propios del usuario autenticado
CREATE POLICY "Allow user to select own favorites" ON favorites
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Inserción sólo de los favoritos propios del usuario autenticado
CREATE POLICY "Allow user to insert own favorites" ON favorites
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Eliminación sólo de los favoritos propios del usuario autenticado
CREATE POLICY "Allow user to delete own favorites" ON favorites
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-------------------------------------------------------
-- 2. TABLA: orders
-------------------------------------------------------
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on orders" ON orders;
DROP POLICY IF EXISTS "Allow public insert on orders" ON orders;
DROP POLICY IF EXISTS "Allow individual user or admin to read orders" ON orders;

-- Permitir checkout de pedidos (inserción pública)
CREATE POLICY "Allow public insert on orders" ON orders
FOR INSERT TO public
WITH CHECK (true);

-- Permitir lectura únicamente al dueño del pedido (coincide email) o admin/service_role
CREATE POLICY "Allow individual user or admin to read orders" ON orders
FOR SELECT TO public
USING (
  customer_email = (auth.jwt() ->> 'email')
  OR (auth.jwt() ->> 'role' = 'admin')
  OR current_user IN ('insforge_admin', 'postgres', 'service_role')
);

-------------------------------------------------------
-- 3. TABLAS: products y categories
-------------------------------------------------------
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on products" ON products;
CREATE POLICY "Allow public select on products" ON products
FOR SELECT TO public
USING (true);

DROP POLICY IF EXISTS "Allow public select on categories" ON categories;
CREATE POLICY "Allow public select on categories" ON categories
FOR SELECT TO public
USING (true);
