-- Interacciones reutilizables para cualquier punto del mapa.

CREATE TABLE IF NOT EXISTS public.comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comentarios(id) ON DELETE CASCADE,
  entidad_tipo TEXT NOT NULL CHECK (entidad_tipo IN ('company', 'event', 'place')),
  entidad_id TEXT NOT NULL,
  contenido TEXT NOT NULL CHECK (char_length(trim(contenido)) BETWEEN 1 AND 2000),
  fijado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.comentarios ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.comentarios(id) ON DELETE CASCADE;
ALTER TABLE public.comentarios ADD COLUMN IF NOT EXISTS fijado BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.comentarios_likes (
  comentario_id UUID NOT NULL REFERENCES public.comentarios(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (comentario_id, usuario_id)
);

CREATE TABLE IF NOT EXISTS public.mensajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  remitente_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destinatario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL CHECK (char_length(trim(contenido)) BETWEEN 1 AND 5000),
  leido BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (remitente_id <> destinatario_id)
);

CREATE TABLE IF NOT EXISTS public.likes (
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entidad_tipo TEXT NOT NULL CHECK (entidad_tipo IN ('company', 'event', 'place')),
  entidad_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (usuario_id, entidad_tipo, entidad_id)
);

CREATE TABLE IF NOT EXISTS public.guardados (
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entidad_tipo TEXT NOT NULL CHECK (entidad_tipo IN ('company', 'event', 'place')),
  entidad_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (usuario_id, entidad_tipo, entidad_id)
);

CREATE TABLE IF NOT EXISTS public.comentarios_reportados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comentario_id UUID NOT NULL REFERENCES public.comentarios(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  motivo TEXT NOT NULL CHECK (char_length(trim(motivo)) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (comentario_id, usuario_id)
);

CREATE INDEX IF NOT EXISTS idx_comentarios_entidad ON public.comentarios(entidad_tipo, entidad_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comentarios_fijados ON public.comentarios(entidad_tipo, entidad_id, fijado DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comentarios_parent ON public.comentarios(parent_id, created_at ASC);
-- Consultas de mensajes filtran por ambos participantes en cualquiera de los sentidos.
CREATE INDEX IF NOT EXISTS idx_mensajes_conversacion ON public.mensajes(remitente_id, destinatario_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mensajes_destinatario_fecha ON public.mensajes(destinatario_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mensajes_remitente_fecha ON public.mensajes(remitente_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mensajes_no_leidos ON public.mensajes(destinatario_id, created_at DESC) WHERE leido = false;
CREATE INDEX IF NOT EXISTS idx_comentarios_usuario_fecha ON public.comentarios(usuario_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comentarios_likes_usuario ON public.comentarios_likes(usuario_id, comentario_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_reportados_usuario ON public.comentarios_reportados(usuario_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_entidad ON public.likes(entidad_tipo, entidad_id);
CREATE INDEX IF NOT EXISTS idx_likes_usuario_fecha ON public.likes(usuario_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guardados_usuario ON public.guardados(usuario_id, created_at DESC);

ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios_reportados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comentarios_publicos_select" ON public.comentarios;
CREATE POLICY "comentarios_publicos_select" ON public.comentarios FOR SELECT USING (true);
DROP POLICY IF EXISTS "comentarios_own_insert" ON public.comentarios;
CREATE POLICY "comentarios_own_insert" ON public.comentarios FOR INSERT WITH CHECK (auth.uid() = usuario_id);
DROP POLICY IF EXISTS "comentarios_own_update" ON public.comentarios;
CREATE POLICY "comentarios_own_update" ON public.comentarios FOR UPDATE USING (auth.uid() = usuario_id);
DROP POLICY IF EXISTS "comentarios_own_delete" ON public.comentarios;
CREATE POLICY "comentarios_own_delete" ON public.comentarios FOR DELETE USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "likes_publicos_select" ON public.likes;
CREATE POLICY "likes_publicos_select" ON public.likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "likes_own_write" ON public.likes;
CREATE POLICY "likes_own_write" ON public.likes FOR ALL USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "guardados_own_select" ON public.guardados;
CREATE POLICY "guardados_own_select" ON public.guardados FOR SELECT USING (auth.uid() = usuario_id);
DROP POLICY IF EXISTS "guardados_own_write" ON public.guardados;
CREATE POLICY "guardados_own_write" ON public.guardados FOR ALL USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "reportes_own_write" ON public.comentarios_reportados;
CREATE POLICY "reportes_own_write" ON public.comentarios_reportados FOR INSERT WITH CHECK (auth.uid() = usuario_id);
DROP POLICY IF EXISTS "reportes_own_select" ON public.comentarios_reportados;
CREATE POLICY "reportes_own_select" ON public.comentarios_reportados FOR SELECT USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "comentarios_likes_publicos_select" ON public.comentarios_likes;
CREATE POLICY "comentarios_likes_publicos_select" ON public.comentarios_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "comentarios_likes_own_write" ON public.comentarios_likes;
CREATE POLICY "comentarios_likes_own_write" ON public.comentarios_likes FOR ALL USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "mensajes_participantes_select" ON public.mensajes;
CREATE POLICY "mensajes_participantes_select" ON public.mensajes FOR SELECT USING (auth.uid() = remitente_id OR auth.uid() = destinatario_id);
DROP POLICY IF EXISTS "mensajes_own_insert" ON public.mensajes;
CREATE POLICY "mensajes_own_insert" ON public.mensajes FOR INSERT WITH CHECK (auth.uid() = remitente_id);

-- Reforzar perfiles: el usuario puede modificar datos propios, pero no su rol.
DROP POLICY IF EXISTS "usuarios_update_own" ON public.usuarios;
CREATE POLICY "usuarios_update_own" ON public.usuarios
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK (
    (select auth.uid()) = id
    AND rol = (SELECT u.rol FROM public.usuarios u WHERE u.id = (select auth.uid()))
  );

DROP POLICY IF EXISTS "usuarios_insert_own" ON public.usuarios;
CREATE POLICY "usuarios_insert_own" ON public.usuarios
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = id AND rol = 'usuario');

DROP POLICY IF EXISTS "usuarios_select_own" ON public.usuarios;
CREATE POLICY "usuarios_select_own" ON public.usuarios
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = id);

-- Un destinatario solo puede marcar el mensaje como leído.
DROP POLICY IF EXISTS "mensajes_destinatario_update" ON public.mensajes;
CREATE POLICY "mensajes_destinatario_update" ON public.mensajes
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = destinatario_id)
  WITH CHECK (
    (select auth.uid()) = destinatario_id
    AND remitente_id = remitente_id
    AND destinatario_id = destinatario_id
  );

-- El rol no puede ser elevado por usuarios autenticados.
CREATE OR REPLACE FUNCTION public.proteger_rol_usuario()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.rol IS DISTINCT FROM OLD.rol THEN
    RAISE EXCEPTION 'El rol de usuario no puede modificarse desde una operación normal.';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS proteger_rol_usuario ON public.usuarios;
CREATE TRIGGER proteger_rol_usuario
BEFORE UPDATE ON public.usuarios
FOR EACH ROW EXECUTE FUNCTION public.proteger_rol_usuario();

-- El destinatario puede cambiar únicamente el estado leído.
CREATE OR REPLACE FUNCTION public.proteger_mensaje_leido()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.remitente_id IS DISTINCT FROM OLD.remitente_id
     OR NEW.destinatario_id IS DISTINCT FROM OLD.destinatario_id
     OR NEW.contenido IS DISTINCT FROM OLD.contenido
     OR NEW.tipo IS DISTINCT FROM OLD.tipo
     OR NEW.audio_path IS DISTINCT FROM OLD.audio_path
     OR NEW.duration_seconds IS DISTINCT FROM OLD.duration_seconds
     OR NEW.attachments IS DISTINCT FROM OLD.attachments
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Solo se permite actualizar el estado leído del mensaje.';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS proteger_mensaje_leido ON public.mensajes;
CREATE TRIGGER proteger_mensaje_leido
BEFORE UPDATE ON public.mensajes
FOR EACH ROW EXECUTE FUNCTION public.proteger_mensaje_leido();
