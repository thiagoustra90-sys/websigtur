-- Fase 1: agregar nombres en español y conservar compatibilidad con clientes actuales.
ALTER TABLE public.places
  ADD COLUMN IF NOT EXISTS descripcion TEXT,
  ADD COLUMN IF NOT EXISTS ubicacion TEXT,
  ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ;

UPDATE public.places
SET descripcion = COALESCE(descripcion, description),
    ubicacion = COALESCE(ubicacion, location),
    creado_en = COALESCE(creado_en, created_at)
WHERE descripcion IS NULL AND description IS NOT NULL
   OR ubicacion IS NULL AND location IS NOT NULL
   OR creado_en IS NULL;

ALTER TABLE public.places ALTER COLUMN creado_en SET NOT NULL;

CREATE OR REPLACE FUNCTION public.sincronizar_columnas_lugares_es()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.descripcion := COALESCE(NEW.descripcion, NEW.description);
    NEW.description := NEW.descripcion;
    NEW.ubicacion := COALESCE(NEW.ubicacion, NEW.location);
    NEW.location := NEW.ubicacion;
    IF NEW.creado_en IS NOT NULL THEN
      NEW.created_at := NEW.creado_en;
    ELSE
      NEW.creado_en := NEW.created_at;
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.descripcion IS DISTINCT FROM OLD.descripcion THEN
    NEW.description := NEW.descripcion;
  ELSIF NEW.description IS DISTINCT FROM OLD.description THEN
    NEW.descripcion := NEW.description;
  END IF;
  IF NEW.ubicacion IS DISTINCT FROM OLD.ubicacion THEN
    NEW.location := NEW.ubicacion;
  ELSIF NEW.location IS DISTINCT FROM OLD.location THEN
    NEW.ubicacion := NEW.location;
  END IF;
  IF NEW.creado_en IS DISTINCT FROM OLD.creado_en THEN
    NEW.created_at := NEW.creado_en;
  ELSIF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    NEW.creado_en := NEW.created_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS lugares_sincronizar_columnas_es ON public.places;
CREATE TRIGGER lugares_sincronizar_columnas_es
BEFORE INSERT OR UPDATE ON public.places
FOR EACH ROW EXECUTE FUNCTION public.sincronizar_columnas_lugares_es();
