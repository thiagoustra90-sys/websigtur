-- Migrar marcas de tiempo de interacciones sin cambiar sus tablas ni contratos actuales.
ALTER TABLE public.comentarios ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ;
ALTER TABLE public.comentarios_likes ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ;
ALTER TABLE public.mensajes ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ;
ALTER TABLE public.likes ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ;
ALTER TABLE public.guardados ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ;
ALTER TABLE public.comentarios_reportados ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ;

UPDATE public.comentarios SET creado_en = COALESCE(creado_en, created_at) WHERE creado_en IS NULL;
UPDATE public.comentarios_likes SET creado_en = COALESCE(creado_en, created_at) WHERE creado_en IS NULL;
UPDATE public.mensajes SET creado_en = COALESCE(creado_en, created_at) WHERE creado_en IS NULL;
UPDATE public.likes SET creado_en = COALESCE(creado_en, created_at) WHERE creado_en IS NULL;
UPDATE public.guardados SET creado_en = COALESCE(creado_en, created_at) WHERE creado_en IS NULL;
UPDATE public.comentarios_reportados SET creado_en = COALESCE(creado_en, created_at) WHERE creado_en IS NULL;

ALTER TABLE public.comentarios ALTER COLUMN creado_en SET NOT NULL;
ALTER TABLE public.comentarios_likes ALTER COLUMN creado_en SET NOT NULL;
ALTER TABLE public.mensajes ALTER COLUMN creado_en SET NOT NULL;
ALTER TABLE public.likes ALTER COLUMN creado_en SET NOT NULL;
ALTER TABLE public.guardados ALTER COLUMN creado_en SET NOT NULL;
ALTER TABLE public.comentarios_reportados ALTER COLUMN creado_en SET NOT NULL;

DROP TRIGGER IF EXISTS comentarios_sincronizar_creado_en ON public.comentarios;
CREATE TRIGGER comentarios_sincronizar_creado_en BEFORE INSERT OR UPDATE ON public.comentarios
FOR EACH ROW EXECUTE FUNCTION public.sincronizar_creado_en('created_at', 'creado_en');
DROP TRIGGER IF EXISTS comentarios_likes_sincronizar_creado_en ON public.comentarios_likes;
CREATE TRIGGER comentarios_likes_sincronizar_creado_en BEFORE INSERT OR UPDATE ON public.comentarios_likes
FOR EACH ROW EXECUTE FUNCTION public.sincronizar_creado_en('created_at', 'creado_en');
DROP TRIGGER IF EXISTS mensajes_sincronizar_creado_en ON public.mensajes;
CREATE TRIGGER mensajes_sincronizar_creado_en BEFORE INSERT OR UPDATE ON public.mensajes
FOR EACH ROW EXECUTE FUNCTION public.sincronizar_creado_en('created_at', 'creado_en');
DROP TRIGGER IF EXISTS likes_sincronizar_creado_en ON public.likes;
CREATE TRIGGER likes_sincronizar_creado_en BEFORE INSERT OR UPDATE ON public.likes
FOR EACH ROW EXECUTE FUNCTION public.sincronizar_creado_en('created_at', 'creado_en');
DROP TRIGGER IF EXISTS guardados_sincronizar_creado_en ON public.guardados;
CREATE TRIGGER guardados_sincronizar_creado_en BEFORE INSERT OR UPDATE ON public.guardados
FOR EACH ROW EXECUTE FUNCTION public.sincronizar_creado_en('created_at', 'creado_en');
DROP TRIGGER IF EXISTS comentarios_reportados_sincronizar_creado_en ON public.comentarios_reportados;
CREATE TRIGGER comentarios_reportados_sincronizar_creado_en BEFORE INSERT OR UPDATE ON public.comentarios_reportados
FOR EACH ROW EXECUTE FUNCTION public.sincronizar_creado_en('created_at', 'creado_en');
