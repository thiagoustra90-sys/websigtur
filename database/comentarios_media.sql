-- Soporte de imágenes y GIFs para comentarios de mapa y eventos.
-- Ejecutar una vez en Supabase SQL Editor.

ALTER TABLE public.comentarios
  ADD COLUMN IF NOT EXISTS media_paths JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.comentarios
  DROP CONSTRAINT IF EXISTS comentarios_contenido_check;

ALTER TABLE public.comentarios
  ADD CONSTRAINT comentarios_contenido_check
  CHECK (
    char_length(trim(contenido)) BETWEEN 1 AND 2000
    OR (
      char_length(trim(contenido)) = 0
      AND CASE
        WHEN jsonb_typeof(media_paths) = 'array' THEN jsonb_array_length(media_paths) > 0
        ELSE false
      END
    )
  );

ALTER TABLE public.comentarios
  DROP CONSTRAINT IF EXISTS comentarios_media_paths_check;

ALTER TABLE public.comentarios
  ADD CONSTRAINT comentarios_media_paths_check
  CHECK (
    CASE
      WHEN jsonb_typeof(media_paths) = 'array' THEN jsonb_array_length(media_paths) <= 3
      ELSE false
    END
  );

-- El bucket es público solo para lectura; las cargas pasan por el backend
-- autenticado usando la clave de servicio, que nunca se envía al navegador.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'comment-media',
  'comment-media',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
