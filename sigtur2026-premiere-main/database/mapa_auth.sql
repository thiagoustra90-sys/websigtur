-- ============================================================================
-- Migración: soporte de mapa (lat/lng, categorías, imagen) + perfiles de auth
-- Motor objetivo: Supabase / PostgreSQL (el que usa backend/config/supabase.js)
-- Ejecutar en el SQL Editor de Supabase, en orden, una sola vez.
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

-- Corrección de los puntos destacados contrastados contra cartografía pública.
-- Se actualizan aunque ya tengan coordenadas: las versiones previas usaban
-- valores aproximados que desplazaban los marcadores varias cuadras.
DO $$
BEGIN
  IF to_regclass('public.places') IS NOT NULL THEN
    UPDATE public.places SET latitude = -31.388763, longitude = -57.960618
      WHERE name IN ('Plaza Artigas', 'Plaza 18 de Julio');
    UPDATE public.places SET latitude = -31.379470, longitude = -57.948920
      WHERE name IN ('Parque Benito Solari', 'Parque Solari');
    UPDATE public.places SET latitude = -31.387490, longitude = -57.970060
      WHERE name IN ('Plaza Treinta y Tres', 'Plaza Treinta y Tres Orientales', 'Plaza 33 Orientales');

    -- Etiquetas pensadas para orientar familias y recorridos temáticos. Cada
    -- punto puede pertenecer a más de una, por eso se persisten como arreglo.
    UPDATE public.places SET categories = ARRAY['Histórico', 'Imperdible', 'Infantil']
      WHERE name IN ('Plaza Artigas', 'Plaza 18 de Julio');
    UPDATE public.places SET categories = ARRAY['Deportes', 'Imperdible', 'Infantil']
      WHERE name = 'Costanera Norte';
    UPDATE public.places SET categories = ARRAY['Histórico', 'Cultura', 'Infantil', 'Deportes']
      WHERE name IN ('Parque Benito Solari', 'Parque Solari');
    UPDATE public.places SET categories = ARRAY['Histórico', 'Imperdible', 'Religioso', 'Infantil']
      WHERE name IN ('Plaza Treinta y Tres', 'Plaza Treinta y Tres Orientales', 'Plaza 33 Orientales');
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

-- ----------------------------------------------------------------------------
-- 3) Datos de ejemplo con coordenadas reales de Salto, Uruguay, para que el
--    mapa tenga algo que mostrar apenas se corre la migración.
--    (borrar/ajustar estos UPDATE si ya tenés datos reales cargados)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.places') IS NOT NULL THEN
    UPDATE public.places SET latitude = -31.38351, longitude = -57.96069,
      categories = ARRAY['Histórico','Imperdible'], address = 'Manzana de Uruguay, Artigas, 25 de Agosto y 18 de Julio'
      WHERE name = 'Plaza Artigas' AND latitude IS NULL;
    UPDATE public.places SET latitude = -31.36945, longitude = -57.97070,
      categories = ARRAY['Deportes','Imperdible'], address = 'Rambla Costanera Norte, Río Uruguay'
      WHERE name = 'Costanera Norte' AND latitude IS NULL;
  END IF;
END $$;

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
