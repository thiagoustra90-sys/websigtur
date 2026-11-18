-- Fase 1: agregar nombres en español y conservar compatibilidad con el backend actual.
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS titulo TEXT,
  ADD COLUMN IF NOT EXISTS descripcion TEXT,
  ADD COLUMN IF NOT EXISTS ubicacion TEXT,
  ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ;

UPDATE public.events
SET titulo = COALESCE(titulo, title),
    descripcion = COALESCE(descripcion, description),
    ubicacion = COALESCE(ubicacion, location),
    creado_en = COALESCE(creado_en, created_at)
WHERE titulo IS NULL
   OR descripcion IS NULL AND description IS NOT NULL
   OR ubicacion IS NULL AND location IS NOT NULL
   OR creado_en IS NULL;

ALTER TABLE public.events ALTER COLUMN titulo SET NOT NULL;
ALTER TABLE public.events ALTER COLUMN creado_en SET NOT NULL;

CREATE OR REPLACE FUNCTION public.sincronizar_columnas_eventos_es()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.titulo := COALESCE(NEW.titulo, NEW.title);
    NEW.title := NEW.titulo;
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

  IF NEW.titulo IS DISTINCT FROM OLD.titulo THEN
    NEW.title := NEW.titulo;
  ELSIF NEW.title IS DISTINCT FROM OLD.title THEN
    NEW.titulo := NEW.title;
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

DROP TRIGGER IF EXISTS eventos_sincronizar_columnas_es ON public.events;
CREATE TRIGGER eventos_sincronizar_columnas_es
BEFORE INSERT OR UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.sincronizar_columnas_eventos_es();
