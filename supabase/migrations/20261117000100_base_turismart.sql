-- Supabase / PostgreSQL para la base vectorial del chatbot
-- Requiere la extensión pgvector habilitada

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.busines (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  location TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.events (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date_start DATE,
  date_end DATE,
  location TEXT,
  price NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.places (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  description TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ?ndices alineados con filtros de categor?a/tipo y orden temporal del cat?logo.
CREATE INDEX IF NOT EXISTS idx_busines_category ON public.busines(category);
CREATE INDEX IF NOT EXISTS idx_events_date_start ON public.events(date_start);
CREATE INDEX IF NOT EXISTS idx_places_type ON public.places(type);

CREATE TABLE IF NOT EXISTS public.chatbot_knowledge (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  source TEXT,
  language TEXT NOT NULL DEFAULT 'es',
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chatbot_knowledge_category ON public.chatbot_knowledge(category);

CREATE INDEX IF NOT EXISTS chatbot_knowledge_embedding_idx
  ON public.chatbot_knowledge
  USING hnsw (embedding vector_cosine_ops);

CREATE OR REPLACE FUNCTION public.match_chatbot_knowledge(query_embedding VECTOR(1536), match_count INT DEFAULT 5)
RETURNS TABLE (
  id BIGINT,
  title TEXT,
  content TEXT,
  category TEXT,
  source TEXT,
  similarity DOUBLE PRECISION
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    ck.id,
    ck.title,
    ck.content,
    ck.category,
    ck.source,
    1 - (ck.embedding <=> query_embedding) AS similarity
  FROM public.chatbot_knowledge AS ck
  ORDER BY ck.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Nota:
-- Para cargar embeddings reales, reemplazar los NULL con vectors generados por OpenAI, Cohere o otro modelo.
-- Ejemplo de consulta de similitud:
-- SELECT * FROM public.match_chatbot_knowledge(
--   (SELECT embedding FROM public.chatbot_knowledge WHERE id = 1),
--   3
-- );
