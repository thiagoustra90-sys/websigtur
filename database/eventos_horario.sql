-- Ejecutar en Supabase para guardar el horario publicado de cada evento.
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS event_time TIME;