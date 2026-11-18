-- Migrar marcas temporales de soporte y actividad administrativa.
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ;
ALTER TABLE public.admin_activity ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ;
ALTER TABLE public.audit_admin_roles ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ;

UPDATE public.support_tickets SET creado_en = COALESCE(creado_en, created_at) WHERE creado_en IS NULL;
UPDATE public.admin_activity SET creado_en = COALESCE(creado_en, created_at) WHERE creado_en IS NULL;
UPDATE public.audit_admin_roles SET creado_en = COALESCE(creado_en, created_at) WHERE creado_en IS NULL;

ALTER TABLE public.support_tickets ALTER COLUMN creado_en SET NOT NULL;
ALTER TABLE public.admin_activity ALTER COLUMN creado_en SET NOT NULL;
ALTER TABLE public.audit_admin_roles ALTER COLUMN creado_en SET NOT NULL;

DROP TRIGGER IF EXISTS soporte_sincronizar_creado_en ON public.support_tickets;
CREATE TRIGGER soporte_sincronizar_creado_en BEFORE INSERT OR UPDATE ON public.support_tickets
FOR EACH ROW EXECUTE FUNCTION public.sincronizar_creado_en('created_at', 'creado_en');
DROP TRIGGER IF EXISTS actividad_admin_sincronizar_creado_en ON public.admin_activity;
CREATE TRIGGER actividad_admin_sincronizar_creado_en BEFORE INSERT OR UPDATE ON public.admin_activity
FOR EACH ROW EXECUTE FUNCTION public.sincronizar_creado_en('created_at', 'creado_en');
DROP TRIGGER IF EXISTS auditoria_roles_sincronizar_creado_en ON public.audit_admin_roles;
CREATE TRIGGER auditoria_roles_sincronizar_creado_en BEFORE INSERT OR UPDATE ON public.audit_admin_roles
FOR EACH ROW EXECUTE FUNCTION public.sincronizar_creado_en('created_at', 'creado_en');
