-- Ejecutar en Supabase para guardar el color elegido para cada evento.
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS color TEXT NOT NULL DEFAULT '#16b3a3';
