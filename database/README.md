# Base de datos SIGTUR

## Fuente y motores

El backend actual usa **Supabase/PostgreSQL**. Las migraciones de ese esquema viven en `supabase/migrations/` y se aplican en orden mediante Supabase CLI (`supabase db push`); el historial `supabase_migrations.schema_migrations` impide volver a ejecutar una migración registrada. No ejecutes esos archivos sueltos repetidamente desde SQL Editor.

`database/legacy/turismart_mysql_dump.sql` y `database/legacy/xampp_mysql.sql` son inicializadores históricos para MariaDB/MySQL de XAMPP, no migraciones PostgreSQL. Describen tablas `usuarios`, `empresas`, `eventos`, `atracciones` y tarjetas; no son equivalentes a `public.usuarios` ligada a `auth.users`, `busines`, `events` y `places`. El dump `turismart.sql` se conserva como referencia histórica. No importar esos archivos en Supabase.

## Migraciones obligatorias

Para una instalación nueva de Supabase, vincula el proyecto y ejecuta `supabase db push`. Se aplican en orden:

1. `20261117000100_base_turismart.sql`: tablas base y búsqueda vectorial (requiere pgvector).
2. `20261117000200_mapa_auth.sql`: columnas del mapa y perfiles Supabase Auth.
3. `20261117000300_interacciones.sql`: comentarios, respuestas, likes, guardados y mensajes.
4. `20261117000400_comentarios_media.sql`: adjuntos de comentarios y bucket.
5. `20261117000500_mensajes_audio.sql`: audio/archivos de mensajes y buckets privados.
6. `20261117000600_horario_eventos.sql`: horario de eventos.
7. `20261117000700_admin_audit.sql`: tabla de auditor?a para roles administrativos.

La columna de color de evento ya forma parte de la migración de mapa; `database/legacy/eventos_color_obsoleto.sql` queda solo como referencia y no se ejecuta. La promoción de una cuenta a administrador es una operación puntual documentada en `database/operations/promover_administrador.sql`, no una migración automática.

### Proyectos ya existentes

No ejecutes ciegamente toda la cadena sobre una base creada con SQL Editor. Primero compara el esquema real y los scripts que ya se aplicaron. Después registra en Supabase CLI como aplicadas las versiones que efectivamente ya están instaladas (`supabase migration repair --status applied <versiones>`), y usa `supabase db push` para las pendientes. No marques una versión aplicada sin verificarla: los archivos versionados son inmutables y el historial es la protección contra ejecuciones repetidas.

## Ejemplos y operaciones

`database/seeds/desarrollo.sql` contiene datos de demostración opcionales. Solo se usa en un entorno de desarrollo descartable, después de las migraciones; no es requisito de producción y puede modificar coordenadas de filas con nombres coincidentes. No contiene credenciales.

El archivo de promoción administrativa requiere configurar explícitamente el correo y se ejecuta una sola vez cuando corresponde. No debe agregarse a `supabase/migrations`.

## Comparación con `turismart.sql`

El dump MySQL heredado se contrastó con el esquema Supabase que crean las migraciones. En Supabase, los usuarios y contraseñas pertenecen a `auth.users`; `public.usuarios` guarda perfil/rol y usa UUID con borrado en cascada. Las empresas/eventos/lugares usan nombres y columnas distintos (`busines`, `events`, `places`) y los IDs de entidad de interacciones son texto porque abarcan esas tres tablas. `comentarios.parent_id`, likes, reportes y autores sí usan claves foráneas con cascada. No se agregan FKs desde interacciones a una tabla turística concreta: `entidad_tipo` + `entidad_id` es una relación polimórfica y la entidad puede estar en cualquiera de las tres tablas.

Las tablas de `tarjetas_destacadas` y `contactos` del SQL MySQL no tienen equivalente en estas migraciones Supabase. La tabla `chatbot_knowledge` sí es específica del backend vectorial. Si se necesita importar los datos MySQL, hace falta una migración de datos explícita con mapeo de IDs; no se deben copiar los dumps directamente.
