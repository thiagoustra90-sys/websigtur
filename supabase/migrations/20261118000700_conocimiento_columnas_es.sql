-- Fase 1: migrar el vocabulario de la tabla de conocimiento por separado.
ALTER TABLE public.chatbot_knowledge
  ADD COLUMN IF NOT EXISTS titulo TEXT,
  ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ;

UPDATE public.chatbot_knowledge
SET titulo = COALESCE(titulo, title),
    creado_en = COALESCE(creado_en, created_at)
WHERE titulo IS NULL OR creado_en IS NULL;

ALTER TABLE public.chatbot_knowledge ALTER COLUMN titulo SET NOT NULL;
ALTER TABLE public.chatbot_knowledge ALTER COLUMN creado_en SET NOT NULL;

CREATE OR REPLACE FUNCTION public.sincronizar_columnas_conocimiento_es()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.titulo := COALESCE(NEW.titulo, NEW.title);
    NEW.title := NEW.titulo;
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
  IF NEW.creado_en IS DISTINCT FROM OLD.creado_en THEN
    NEW.created_at := NEW.creado_en;
  ELSIF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    NEW.creado_en := NEW.created_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS conocimiento_sincronizar_columnas_es ON public.chatbot_knowledge;
CREATE TRIGGER conocimiento_sincronizar_columnas_es
BEFORE INSERT OR UPDATE ON public.chatbot_knowledge
FOR EACH ROW EXECUTE FUNCTION public.sincronizar_columnas_conocimiento_es();
