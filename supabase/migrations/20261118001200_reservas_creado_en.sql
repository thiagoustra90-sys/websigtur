-- Migrar las marcas de creación de planes y reservas en una fase independiente.
ALTER TABLE public.tourism_plans ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ;
ALTER TABLE public.event_reservations ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ;

UPDATE public.tourism_plans SET creado_en = COALESCE(creado_en, created_at) WHERE creado_en IS NULL;
UPDATE public.event_reservations SET creado_en = COALESCE(creado_en, created_at) WHERE creado_en IS NULL;

ALTER TABLE public.tourism_plans ALTER COLUMN creado_en SET NOT NULL;
ALTER TABLE public.event_reservations ALTER COLUMN creado_en SET NOT NULL;

DROP TRIGGER IF EXISTS planes_turisticos_sincronizar_creado_en ON public.tourism_plans;
CREATE TRIGGER planes_turisticos_sincronizar_creado_en BEFORE INSERT OR UPDATE ON public.tourism_plans
FOR EACH ROW EXECUTE FUNCTION public.sincronizar_creado_en('created_at', 'creado_en');
DROP TRIGGER IF EXISTS reservas_eventos_sincronizar_creado_en ON public.event_reservations;
CREATE TRIGGER reservas_eventos_sincronizar_creado_en BEFORE INSERT OR UPDATE ON public.event_reservations
FOR EACH ROW EXECUTE FUNCTION public.sincronizar_creado_en('created_at', 'creado_en');
