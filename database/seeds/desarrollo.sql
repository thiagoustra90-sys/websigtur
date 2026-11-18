-- Datos opcionales para desarrollo. Ejecutar después de las migraciones en un entorno descartable.
-- No crea usuarios ni contraseñas de ejemplo.
INSERT INTO public.chatbot_knowledge (title, content, category, source, language)
VALUES
  ('Salto, Uruguay', 'Salto es una ciudad turística del noroeste de Uruguay, conocida por sus paisajes ribereños, gastronomía y eventos culturales.', 'general', 'seed', 'es'),
  ('Plaza Artigas', 'Plaza Artigas es un espacio histórico y cultural del centro de Salto.', 'lugar', 'seed', 'es'),
  ('Festival de la Primavera', 'Evento anual con música, artesanía, gastronomía y actividades para familias y turistas.', 'evento', 'seed', 'es')
ON CONFLICT DO NOTHING;

-- Ubicaciones de demostración opcionales para filas que ya existan en public.places.
UPDATE public.places SET latitude = -31.388763, longitude = -57.960618,
  categories = ARRAY['Histórico', 'Imperdible', 'Infantil']
WHERE name IN ('Plaza Artigas', 'Plaza 18 de Julio');
UPDATE public.places SET latitude = -31.379470, longitude = -57.948920,
  categories = ARRAY['Histórico', 'Cultura', 'Infantil', 'Deportes']
WHERE name IN ('Parque Benito Solari', 'Parque Solari');
UPDATE public.places SET latitude = -31.387490, longitude = -57.970060,
  categories = ARRAY['Histórico', 'Imperdible', 'Religioso', 'Infantil']
WHERE name IN ('Plaza Treinta y Tres', 'Plaza Treinta y Tres Orientales', 'Plaza 33 Orientales');
UPDATE public.places SET categories = ARRAY['Deportes', 'Imperdible', 'Infantil']
WHERE name = 'Costanera Norte';
