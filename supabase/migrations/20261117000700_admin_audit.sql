-- Registro administrativo para cambios manuales de rol.
CREATE TABLE IF NOT EXISTS public.audit_admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rol_anterior TEXT,
  rol_nuevo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_admin_roles_usuario_fecha
  ON public.audit_admin_roles(usuario_id, created_at DESC);

ALTER TABLE public.audit_admin_roles ENABLE ROW LEVEL SECURITY;
