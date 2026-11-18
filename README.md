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

## Base de datos

Las migraciones obligatorias y su orden se describen en `supabase/MIGRACIONES.md`. Usa Supabase CLI (`supabase db push`) para aplicar el historial versionado; no ejecutes manualmente archivos SQL antiguos de `database/legacy/`. Los datos de desarrollo est?n separados en `database/seeds/desarrollo.sql`.

## Despliegue y autenticación

En Render, Express sirve la API y el frontend HTML desde el mismo dominio. Copia `backend/.env.example` como referencia para las variables del servicio; nunca publiques `backend/.env` ni pongas claves en JavaScript. Las páginas PHP antiguas siguen siendo para XAMPP y no forman parte del login de Render.

En Render, configura **Root Directory** como `backend`, **Build Command** como `npm install` y **Start Command** como `npm start`. Este servicio Express sirve tanto la API como el frontend estático: el login queda en `https://websigtur.onrender.com/login.html`. Configura las variables privadas `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `FRONTEND_ORIGIN=https://websigtur.onrender.com`, `FRONTEND_URL=https://websigtur.onrender.com/login.html`, `PASSWORD_RESET_REDIRECT_URL=https://websigtur.onrender.com/login.html` y `OAUTH_REDIRECT_URL=https://websigtur.onrender.com/api/auth/google/callback`. Render proporciona `PORT`; el servidor tiene `3000` como fallback local.

Si cambias el dominio de Render, actualízalo en esas variables y en `frontend/js/api-config.js`. `FRONTEND_ORIGIN` debe ser únicamente el origen del servicio (sin ruta); `FRONTEND_URL` y `PASSWORD_RESET_REDIRECT_URL` apuntan a `/login.html`; `OAUTH_REDIRECT_URL` apunta a `/api/auth/google/callback`.

En **Supabase > Authentication > URL Configuration**, configura como **Site URL** `https://websigtur.onrender.com` y permite como redirect URLs `https://websigtur.onrender.com/login.html`, `https://websigtur.onrender.com/api/auth/google/callback` y `http://localhost/**` para desarrollo local. En **Authentication > Providers > Google**, configura las credenciales de Google. En Google Cloud, agrega como URI de redirección autorizada la URL de callback de Supabase que muestra el panel de Supabase, no la URL de Render.

El horario de eventos forma parte de las migraciones versionadas. Consulta `supabase/MIGRACIONES.md` y aplica el historial con `supabase db push`.

El endpoint `GET /health` comprueba el proceso sin consultar la base de datos. El callback OAuth valida la sesión de Supabase y devuelve al usuario a `login.html`.

### Desarrollo local con XAMPP

El registro y el inicio de sesión pueden seguir usando el proxy de `frontend/html/api/auth.php`. Para probar OAuth localmente, configura en `backend/.env` los redirects locales correspondientes y agrega esos redirects a la lista permitida de Supabase. Ejecuta `setup_local.bat` desde la carpeta del proyecto para preparar dependencias y abrir el frontend desde XAMPP.

### Modo prioritario XAMPP

Apache puede ejecutar el login sin Node mediante `frontend/html/api/auth.php`. El `.htaccess` transforma `/api/auth/login`, `/api/auth/register`, `/api/auth/me`, `/api/auth/recuperar` y `/api/auth/google` en llamadas PHP del mismo origen.

Completa `SUPABASE_ANON_KEY` en `backend/.env`, aplica las migraciones requeridas con `supabase db push` y abre `setup_local.bat`.

### Imágenes y GIFs en comentarios

Los adjuntos de comentarios se habilitan con la migración `20261117000400_comentarios_media.sql`. Sigue el orden de `supabase/MIGRACIONES.md` y aplica los cambios con `supabase db push`. El bucket `comment-media` permite JPG, PNG, WebP y GIF de hasta 5 MB por archivo; se permiten hasta 3 imágenes por comentario.

### Mensajes directos, archivos y notas de voz

La migración `20261117000500_mensajes_audio.sql` habilita los buckets privados `message-audio` y `message-files`; el backend emite enlaces temporales solo a los participantes. Los mensajes permanecen disponibles aunque el destinatario está desconectado; no se envían notificaciones push. En el chat se puede enviar con Enter (Shift+Enter agrega una línea), pegar o arrastrar imágenes y GIF, además de seleccionarlos desde el dispositivo. Se permiten hasta 3 archivos por mensaje (JPG, PNG, WebP, GIF o PDF), de hasta 10 MB cada uno. Las notas de voz requieren permiso de micrófono y HTTPS o `localhost`, duran hasta 2 minutos y pesan hasta 10 MB.

## Configuración por entorno

### Variables obligatorias

- `SUPABASE_URL`: URL HTTPS del proyecto Supabase.
- `SUPABASE_SERVICE_KEY`: clave privada service-role utilizada únicamente por Node/PHP servidor.
- `SUPABASE_ANON_KEY`: clave pública opcional para consultas solo lectura desde el modo XAMPP.
- `ALLOWED_ORIGINS`: orígenes exactos permitidos por CORS, separados por comas.
- `FRONTEND_ORIGIN`: origen principal del frontend.
- `FRONTEND_URL`: página completa a la que vuelve OAuth.
- `OAUTH_REDIRECT_URL`: callback público de Google en Express.
- `PASSWORD_RESET_REDIRECT_URL`: página pública para restablecer contraseña.

Nunca agregues `SUPABASE_SERVICE_KEY`, secretos OAuth ni claves privadas a archivos JavaScript o HTML.

### Render

1. Root Directory: `backend`.
2. Build Command: `npm ci`.
3. Start Command: `npm start`.
4. Health Check Path: `/health`.
5. Configura `NODE_ENV=production` y todas las variables privadas en el panel de Render.
6. Configura el mismo dominio en `ALLOWED_ORIGINS`, `FRONTEND_ORIGIN`, `FRONTEND_URL`, `OAUTH_REDIRECT_URL` y `PASSWORD_RESET_REDIRECT_URL`.

El archivo `render.yaml` contiene el blueprint del servicio. Los valores secretos deben completarse manualmente en Render y no en el repositorio.

### Desarrollo local

Copia `backend/.env.example` como `backend/.env`, ajusta las URLs locales y ejecuta:

```powershell
npm --prefix backend install
npm --prefix backend run dev
```

Prueba el servidor en `http://localhost:3000/health`. Para usar XAMPP, ejecuta `setup_local.bat` y configura únicamente las claves necesarias en `backend/.env`.

### Comprobaciones

- Sintaxis: `npm --prefix backend run check`
- Tests: `npm --prefix backend test`
- Health check: `npm --prefix backend run health`
- Dependencias: `npm --prefix backend audit --omit=dev`
