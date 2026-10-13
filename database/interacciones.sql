-- Interacciones reutilizables para cualquier punto del mapa.
-- Ejecutar en Supabase SQL Editor después de migration_mapa_auth.sql.

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
CREATE INDEX IF NOT EXISTS idx_mensajes_conversacion ON public.mensajes(remitente_id, destinatario_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_entidad ON public.likes(entidad_tipo, entidad_id);
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
DROP POLICY IF EXISTS "mensajes_destinatario_update" ON public.mensajes;
CREATE POLICY "mensajes_destinatario_update" ON public.mensajes FOR UPDATE USING (auth.uid() = destinatario_id);
