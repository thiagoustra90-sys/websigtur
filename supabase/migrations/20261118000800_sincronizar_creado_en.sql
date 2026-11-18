-- Función de compatibilidad para migrar created_at a creado_en por tabla.
CREATE OR REPLACE FUNCTION public.sincronizar_creado_en()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  valores_nuevos JSONB := to_jsonb(NEW);
  valores_anteriores JSONB;
  instante TIMESTAMPTZ;
  columna_antigua TEXT := TG_ARGV[0];
  columna_nueva TEXT := TG_ARGV[1];
BEGIN
  IF TG_OP = 'INSERT' THEN
    instante := COALESCE(
      NULLIF(valores_nuevos ->> columna_nueva, '')::TIMESTAMPTZ,
      NULLIF(valores_nuevos ->> columna_antigua, '')::TIMESTAMPTZ
    );
  ELSE
    valores_anteriores := to_jsonb(OLD);
    IF valores_nuevos -> columna_nueva IS DISTINCT FROM valores_anteriores -> columna_nueva THEN
      instante := NULLIF(valores_nuevos ->> columna_nueva, '')::TIMESTAMPTZ;
    ELSIF valores_nuevos -> columna_antigua IS DISTINCT FROM valores_anteriores -> columna_antigua THEN
      instante := NULLIF(valores_nuevos ->> columna_antigua, '')::TIMESTAMPTZ;
    ELSE
      RETURN NEW;
    END IF;
  END IF;

  IF instante IS NOT NULL THEN
    valores_nuevos := jsonb_set(valores_nuevos, ARRAY[columna_antigua], to_jsonb(instante), true);
    valores_nuevos := jsonb_set(valores_nuevos, ARRAY[columna_nueva], to_jsonb(instante), true);
    NEW := jsonb_populate_record(NEW, valores_nuevos);
  END IF;
  RETURN NEW;
END;
$$;
