-- ============================================================================
-- Migración: soporte de mapa (lat/lng, categorías, imagen) + perfiles de auth
-- Motor objetivo: Supabase / PostgreSQL (el que usa backend/config/supabase.js)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Columnas de mapa en las tablas existentes (busines, events, places)
--    El front (frontend/html/mapa.php) espera: lat, lng, categorias[], imagen,
--    direccion y enlace por cada punto. Estas tablas no los tenían.
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.busines') IS NOT NULL THEN
    ALTER TABLE public.busines
      ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS image_url TEXT,
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS link TEXT;
    CREATE INDEX IF NOT EXISTS idx_busines_latlng ON public.busines (latitude, longitude);
  END IF;
  IF to_regclass('public.events') IS NOT NULL THEN
    ALTER TABLE public.events
      ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS image_url TEXT,
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS link TEXT,
      ADD COLUMN IF NOT EXISTS color TEXT NOT NULL DEFAULT '#16b3a3';
    CREATE INDEX IF NOT EXISTS idx_events_latlng ON public.events (latitude, longitude);
  END IF;
  IF to_regclass('public.places') IS NOT NULL THEN
    ALTER TABLE public.places
      ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS image_url TEXT,
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS link TEXT;
    CREATE INDEX IF NOT EXISTS idx_places_latlng ON public.places (latitude, longitude);
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 2) Perfiles de usuario (public.usuarios) enlazados a Supabase Auth.
--    Supabase Auth ya maneja auth.users (email, password hasheada, tokens).
--    Esta tabla guarda los datos "de negocio" del usuario (nombre, rol, etc).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  nombre     TEXT NOT NULL,
  apellido   TEXT,
  correo     TEXT NOT NULL UNIQUE,
  rol        TEXT NOT NULL DEFAULT 'usuario' CHECK (rol IN ('admin', 'usuario')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- El backend usa la Service Role Key (bypassea RLS), estas políticas son
-- para el día en que además se llame a Supabase directo desde el cliente.
DROP POLICY IF EXISTS "usuarios_select_own" ON public.usuarios;
CREATE POLICY "usuarios_select_own" ON public.usuarios
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "usuarios_update_own" ON public.usuarios;
CREATE POLICY "usuarios_update_own" ON public.usuarios
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "usuarios_insert_own" ON public.usuarios;
CREATE POLICY "usuarios_insert_own" ON public.usuarios
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Compatibilidad para instalaciones que crearon el perfil con nombres de
-- columnas anteriores. El backend usa nombre, apellido, correo y rol.
ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS nombre TEXT,
  ADD COLUMN IF NOT EXISTS apellido TEXT,
  ADD COLUMN IF NOT EXISTS correo TEXT,
  ADD COLUMN IF NOT EXISTS rol TEXT DEFAULT 'usuario',
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS biografia TEXT,
  ADD COLUMN IF NOT EXISTS ubicacion TEXT,
  ADD COLUMN IF NOT EXISTS sitio_web TEXT,
  ADD COLUMN IF NOT EXISTS nombre_texto TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT;

UPDATE public.usuarios
SET nombre = COALESCE(nombre, nombre_texto),
    correo = COALESCE(correo, email)
WHERE nombre IS NULL OR correo IS NULL;
