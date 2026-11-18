# Arquitectura SIGTUR

## Componentes

- `frontend/html/` contiene páginas HTML y puntos de entrada PHP heredados. `frontend/js/api-config.js` configura el origen de la API; `main.js` coordina las funciones compartidas y los inicializadores por página; `mapa.js` contiene el mapa interactivo. `comment-media.js` administra los adjuntos de comentarios.
- `backend/app.js` configura Express, cabeceras, CORS, límites de peticiones, rutas y manejo común de errores.
- `backend/rutas/` declara endpoints y aplica autenticación, permisos y validación de entrada.
- `backend/controladores/` adapta solicitudes y respuestas HTTP. `backend/servicios/` contiene reglas de negocio e integración con Supabase.
- `backend/config/supabase.js` crea el cliente de servicio del servidor. No se debe importar en código del navegador.
- `supabase/migrations/` guarda cambios de esquema versionados; los datos de desarrollo se mantienen en `database/seeds/`.

## Flujos principales

### Autenticación

El navegador inicia sesión por la API o el proveedor OAuth. Las rutas validan los datos con esquemas Zod y los servicios hablan con Supabase Auth. `requiereSesion` valida el token y comprueba el perfil público antes de permitir el acceso. `requiereAdmin` verifica el rol de metadata o del perfil. El navegador guarda la sesión validada y la adjunta como bearer token a las peticiones privadas.

### Lecturas y escrituras

La ruta entrega la petición al controlador, que llama al servicio correspondiente. El servicio valida permisos sobre recursos y accede a Postgres o Storage mediante el cliente del servidor. Los errores pasan por el middleware común y se convierten en respuestas HTTP.

### Migraciones y desarrollo

Las migraciones obligatorias y el orden están documentados en `supabase/MIGRACIONES.md`. El flujo local usa `backend/.env.example` como referencia, ejecuta `npm install` dentro de `backend/` y levanta la API con `npm run dev`.

## Convenciones y calidad

- Archivos JavaScript, rutas, controladores y servicios en `snake_case`; JavaScript usa `camelCase` para funciones y variables y `PascalCase` para tipos.
- Directorios y assets nuevos en minúsculas, sin espacios y con guiones bajos solo cuando representan nombres compuestos de código.
- Pruebas con `node:test` dentro de `backend/test/`; `npm test` las ejecuta, `npm run lint` ejecuta ESLint y `npm run format:check` comprueba Prettier.
- Para aplicar formato a los archivos JavaScript, JSON y Markdown del backend: `npm run format`.

## Límites actuales

El frontend todavía concentra buena parte de sus inicializadores en `frontend/js/main.js`; las funciones por página siguen compartiendo ese punto de entrada. Las páginas HTML y PHP duplicadas se conservan por compatibilidad durante la transición.
