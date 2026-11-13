-- Audio privado para mensajes directos.
-- Ejecutar una vez en Supabase SQL Editor.

ALTER TABLE public.mensajes
  ADD COLUMN IF NOT EXISTS tipo TEXT NOT NULL DEFAULT 'texto',
  ADD COLUMN IF NOT EXISTS audio_path TEXT,
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER,
  ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.mensajes
  DROP CONSTRAINT IF EXISTS mensajes_tipo_audio_check;

ALTER TABLE public.mensajes
  ADD CONSTRAINT mensajes_tipo_audio_check
  CHECK (
    (tipo = 'texto' AND audio_path IS NULL AND duration_seconds IS NULL)
    OR (
      tipo = 'audio'
      AND audio_path IS NOT NULL
      AND attachments = '[]'::jsonb
      AND duration_seconds BETWEEN 1 AND 120
      AND contenido = 'Mensaje de voz'
    )
    OR (
      tipo = 'archivo'
      AND audio_path IS NULL
      AND duration_seconds IS NULL
      AND contenido = 'Archivos adjuntos'
      AND CASE
        WHEN jsonb_typeof(attachments) = 'array' THEN jsonb_array_length(attachments) BETWEEN 1 AND 3
        ELSE false
      END
    )
  );

ALTER TABLE public.mensajes
  DROP CONSTRAINT IF EXISTS mensajes_attachments_count_check;

ALTER TABLE public.mensajes
  ADD CONSTRAINT mensajes_attachments_count_check
  CHECK (
    CASE
      WHEN jsonb_typeof(attachments) = 'array' THEN jsonb_array_length(attachments) <= 3
      ELSE false
    END
  );

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-audio',
  'message-audio',
  false,
  10485760,
  ARRAY['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-files',
  'message-files',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- El backend almacena y firma los archivos con SUPABASE_SERVICE_KEY.
-- No habilites lectura pública ni compartas esa clave con el navegador.
