-- Datos estructurados para solicitudes de verificación de empresas y organizaciones.
ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS ticket_type TEXT NOT NULL DEFAULT 'general';

ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'support_tickets_ticket_type_check'
      AND conrelid = 'public.support_tickets'::regclass
  ) THEN
    ALTER TABLE public.support_tickets
      ADD CONSTRAINT support_tickets_ticket_type_check
      CHECK (ticket_type IN ('general', 'business_verification'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'support_tickets_details_object_check'
      AND conrelid = 'public.support_tickets'::regclass
  ) THEN
    ALTER TABLE public.support_tickets
      ADD CONSTRAINT support_tickets_details_object_check
      CHECK (jsonb_typeof(details) = 'object');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS support_tickets_type_created_idx
  ON public.support_tickets(ticket_type, created_at DESC);
