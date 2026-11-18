-- Planes y reservas creados por cada cuenta, junto con índices de consulta.
ALTER TABLE public.guardados ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;
CREATE TABLE IF NOT EXISTS public.tourism_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_ref TEXT NOT NULL,
  place_name TEXT NOT NULL,
  visit_date DATE NOT NULL,
  people INTEGER NOT NULL CHECK (people BETWEEN 1 AND 20),
  schedule TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS tourism_plans_user_created_idx ON public.tourism_plans(user_id, created_at DESC);
ALTER TABLE public.tourism_plans ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.event_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_ref TEXT NOT NULL,
  event_title TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 20),
  schedule TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS event_reservations_user_created_idx ON public.event_reservations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS event_reservations_event_idx ON public.event_reservations(event_ref, created_at DESC);
ALTER TABLE public.event_reservations ENABLE ROW LEVEL SECURITY;
