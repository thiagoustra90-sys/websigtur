
## Interacciones reutilizables

La migración `database/migration_interacciones.sql` agrega comentarios, likes, guardados y reportes con el contrato común `entidad_tipo` (`company`, `event`, `place`) + `entidad_id`. Ejecutala en Supabase después de `migration_mapa_auth.sql`.

Orden sugerido de implementación:

1. Ejecutar y revisar la migración con RLS.
2. Probar autenticación y los endpoints `/api/comentarios`, `/api/likes` y `/api/guardados`.
3. Validar el panel de detalle del mapa con usuario anónimo y autenticado.
4. Revisar el perfil y los guardados en distintos tipos de entidad.
5. Agregar moderación administrativa y métricas después de validar el uso real.

Decisiones de producto pendientes:

- Puntaje en comentarios: definir si habrá estrellas/valoración numérica además del texto.
- Edición: actualmente el backend permite editar y borrar comentarios propios; confirmar si se conserva ese comportamiento y por cuánto tiempo.
- Guardados: actualmente es una lista única por usuario; definir si luego se necesitan listas o colecciones personalizadas.

### Foro y administración

Después de `migration_mapa_auth.sql`, ejecutá `database/migration_interacciones.sql` para activar respuestas, likes de comentarios y mensajes privados. Para crear el primer administrador, registrá la cuenta normalmente y reemplazá `ADMIN_EMAIL_AQUI` en `database/migration_admin.sql`; luego ejecutá ese archivo en Supabase. El panel admin queda en `admin.php` y sus operaciones se validan también en el backend.
# SIGTUR – Sistema Inteligente de Gestión Turística

## Institución

**Escuela Superior Catalina H. de Castaños**

## Sobre SIGTUR

SIGTUR es una app tecnológica enfocada en la transformación digital del turismo en el departamento de Salto. Nace con la visión de conectar visitantes, emprendedores, empresas e instituciones a través de una plataforma moderna, intuitiva y centralizada.

Nuestra misión es facilitar el acceso a información turística confiable y actualizada, promoviendo los atractivos, eventos, servicios y experiencias que ofrece Salto. Mediante el uso de tecnología e innovación, buscamos fortalecer el ecosistema turístico local, mejorar la experiencia de los visitantes y potenciar el desarrollo económico de la región.

SIGTUR aspira a convertirse en el principal punto de acceso digital al turismo departamental, integrando herramientas de descubrimiento, promoción y gestión en una única plataforma.

## Equipo Fundador

* Gonzalo Machado
* Manuel Da Silva
* Santiago Mena
* Thiago Ustra

## Visión

Convertir a Salto en un referente de turismo inteligente, impulsado por la innovación tecnológica y el acceso digital a experiencias de calidad.

## Misión

Desarrollar soluciones tecnológicas que conecten personas, destinos y servicios turísticos, promoviendo un turismo más accesible, eficiente y sostenible.

## Despliegue y autenticación

El frontend PHP se publica en un hosting con PHP y el backend Express en Render. Publica el contenido de `frontend` conservando las carpetas `html`, `css`, `js`, `imagenes` y `kml`; las páginas quedarán bajo `/html/` (por ejemplo `/html/index.php`). Copia `backend/.env.example` como referencia para las variables del servicio; nunca publiques `backend/.env` ni pongas claves en JavaScript.

En Render, configura **Root Directory** como `backend`, **Build Command** como `npm install` y **Start Command** como `npm start`. Carga como variables privadas `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `FRONTEND_ORIGIN`, `FRONTEND_URL`, `PASSWORD_RESET_REDIRECT_URL` y `OAUTH_REDIRECT_URL`. Render proporciona `PORT`; el servidor tiene `3000` como fallback local.

Después de publicar ambos servicios, reemplaza los dominios de ejemplo en `backend/.env.example` al configurar Render y en `frontend/js/api-config.js` con la URL HTTPS real del backend. `FRONTEND_ORIGIN` debe ser únicamente el origen del hosting (sin ruta); `FRONTEND_URL` y `PASSWORD_RESET_REDIRECT_URL` apuntan a `/html/login.php`; `OAUTH_REDIRECT_URL` apunta a `/api/auth/google/callback` del servicio Render.

En **Supabase > Authentication > URL Configuration**, permite como redirect URLs la URL de `login.php`, la URL de callback del backend y la de recuperación. En **Authentication > Providers > Google**, configura las credenciales de Google. En Google Cloud, agrega como URI de redirección autorizada la URL de callback de Supabase que muestra el panel de Supabase, no la URL de Render.

El endpoint `GET /health` comprueba el proceso sin consultar la base de datos. El callback OAuth valida la sesión de Supabase y devuelve al usuario a `login.php`.

### Desarrollo local con XAMPP

El registro y el inicio de sesión pueden seguir usando el proxy de `frontend/html/api/auth.php`. Para probar OAuth localmente, configura en `backend/.env` los redirects locales correspondientes y agrega esos redirects a la lista permitida de Supabase. Ejecuta `setup_local.bat` desde la carpeta del proyecto para preparar dependencias y abrir el frontend desde XAMPP.

### Modo prioritario XAMPP

Apache puede ejecutar el login sin Node mediante `frontend/html/api/auth.php`. El `.htaccess` transforma `/api/auth/login`, `/api/auth/register`, `/api/auth/me`, `/api/auth/recuperar` y `/api/auth/google` en llamadas PHP del mismo origen.

Completa también `SUPABASE_ANON_KEY` en `backend/.env`, ejecuta en Supabase `database/migration_mapa_auth.sql` y `database/migration_interacciones.sql`, y abre `setup_local.bat`. La segunda migración es necesaria para que aparezcan los usuarios y funcionen los mensajes privados.

### Imágenes y GIFs en comentarios

Para habilitar adjuntos en los comentarios de eventos y del mapa, ejecuta una vez `database/comentarios_media.sql` en Supabase SQL Editor. Esta migración agrega `media_paths` a `comentarios` y crea/actualiza el bucket público de lectura `comment-media` (JPG, PNG, WebP y GIF, hasta 5 MB por archivo). Las cargas requieren sesión y se procesan desde el backend con `SUPABASE_SERVICE_KEY`; esa clave nunca debe exponerse al frontend. Se permiten hasta 3 imágenes por comentario.

### Mensajes de voz

Para habilitar audios y archivos en mensajes directos, ejecuta `database/mensajes_audio.sql` en Supabase después de `database/interacciones.sql`. Crea los buckets privados `message-audio` y `message-files`; el backend emite enlaces temporales solo a los participantes de la conversación. Las notas de voz requieren permiso de micrófono y HTTPS o `localhost`, duran hasta 2 minutos y pesan hasta 10 MB. Se pueden adjuntar hasta 3 archivos por mensaje (JPG, PNG, WebP, GIF o PDF), de hasta 10 MB cada uno.