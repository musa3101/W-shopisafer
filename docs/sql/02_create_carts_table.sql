-- Script de Creación de la Tabla de Carritos Abandonados / Activos
-- Ejecutar en el SQL Editor del Dashboard de InsForge (https://i5jqzbx6.us-east.insforge.app)

CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  recovery_email_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas previas si existen
DROP POLICY IF EXISTS "Allow public insert on carts" ON public.carts;
DROP POLICY IF EXISTS "Allow public select on carts" ON public.carts;
DROP POLICY IF EXISTS "Allow public update on carts" ON public.carts;
DROP POLICY IF EXISTS "Allow public delete on carts" ON public.carts;

-- 1. Permitir que cualquier visitante (invitado o registrado) cree un carrito
CREATE POLICY "Allow public insert on carts" ON public.carts
FOR INSERT TO public
WITH CHECK (true);

-- 2. Permitir que cualquier visitante recupere un carrito por su ID (UUID confidencial)
CREATE POLICY "Allow public select on carts" ON public.carts
FOR SELECT TO public
USING (true);

-- 3. Permitir que cualquier visitante actualice su carrito
CREATE POLICY "Allow public update on carts" ON public.carts
FOR UPDATE TO public
USING (true);

-- 4. Permitir que cualquier visitante elimine su carrito al vaciarlo o al finalizar la compra
CREATE POLICY "Allow public delete on carts" ON public.carts
FOR DELETE TO public
USING (true);

-- Conceder permisos explícitos de tabla a los roles correspondientes de InsForge (PostgREST)
GRANT ALL ON TABLE public.carts TO postgres, anon, authenticated;
