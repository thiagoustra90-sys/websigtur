-- Migrar perfiles de usuario en una fase independiente.
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ;
UPDATE public.usuarios SET creado_en = COALESCE(creado_en, created_at) WHERE creado_en IS NULL;
ALTER TABLE public.usuarios ALTER COLUMN creado_en SET NOT NULL;

DROP TRIGGER IF EXISTS usuarios_sincronizar_creado_en ON public.usuarios;
CREATE TRIGGER usuarios_sincronizar_creado_en
BEFORE INSERT OR UPDATE ON public.usuarios
FOR EACH ROW EXECUTE FUNCTION public.sincronizar_creado_en('created_at', 'creado_en');
