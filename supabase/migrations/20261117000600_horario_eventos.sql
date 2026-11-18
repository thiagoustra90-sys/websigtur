ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS event_time TIME;
