-- Función helper SECURITY DEFINER para evitar el error "permission denied for table users"
-- Esta función corre con los privilegios del creador (postgres/admin) y puede consultar auth.users
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND is_project_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
  OR public.is_admin()
  OR current_user IN ('insforge_admin', 'postgres', 'service_role')
);

-- Permitir a administradores actualizar órdenes (cambiar estado, etc.)
DROP POLICY IF EXISTS "Allow admin to update orders" ON orders;
CREATE POLICY "Allow admin to update orders" ON orders
FOR UPDATE TO public
USING (
  public.is_admin()
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

-- Permitir edición/inserción de productos sólo a administradores o service role
DROP POLICY IF EXISTS "Allow admin to manage products" ON products;
CREATE POLICY "Allow admin to manage products" ON products
FOR ALL TO public
USING (
  public.is_admin()
  OR current_user IN ('insforge_admin', 'postgres', 'service_role')
);

-- Permitir edición/inserción de categorías sólo a administradores o service role
DROP POLICY IF EXISTS "Allow admin to manage categories" ON categories;
CREATE POLICY "Allow admin to manage categories" ON categories
FOR ALL TO public
USING (
  public.is_admin()
  OR current_user IN ('insforge_admin', 'postgres', 'service_role')
);

