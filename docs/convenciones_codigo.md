# Convenciones de código

## Idioma y nombres

- El código nuevo usa español para nombres internos de variables, parámetros, propiedades propias, funciones y clases. Se aceptan términos técnicos asentados cuando traducirlos vuelve el nombre ambiguo (por ejemplo, `token`, `callback` o `middleware`). Los nombres de bibliotecas y APIs externas conservan su forma original.
- JavaScript usa `camelCase` para variables, parámetros, funciones y propiedades; `PascalCase` para clases; `UPPER_SNAKE_CASE` solo para constantes globales realmente inmutables. Preferir ámbito de módulo y evitar adjuntar estado al objeto global `window`.
- SQL y PHP usan `snake_case` para tablas, columnas, variables, funciones y archivos. Los nombres SQL usan minúsculas. Las carpetas y archivos nuevos usan minúsculas y guiones cuando sean páginas o documentos; mantener las convenciones de los directorios existentes hasta migrarlos de forma controlada.
- Los nombres visibles al público (rutas, parámetros JSON, columnas existentes, eventos y callbacks de terceros) son contratos: no se cambian junto con una renombrada interna.

## Compatibilidad de API y migraciones

1. Dentro de cada capa, convertir el contrato recibido a nombres internos en español en el límite de entrada y convertirlo al formato público al responder. La conversión debe estar centralizada en el controlador o adaptador, no repetida en servicios.
2. Durante la migración, aceptar los nombres públicos actuales y mantener intactas las respuestas para clientes existentes. Documentar cada alias con su fecha/versión de retiro; retirar un nombre solo con cambio de versión anunciado y clientes migrados.
3. Para renombrar columnas SQL, usar una migración versionada compatible: agregar/trasladar datos, actualizar lecturas y escrituras, y eliminar la columna anterior en una migración posterior. No editar migraciones ya aplicadas ni ejecutar scripts históricos como parte del arranque.
4. No renombrar de forma masiva contratos de Supabase Auth, Supabase JS, Google OAuth, DOM o bibliotecas externas. Traducirlos en adaptadores locales.

## Ejemplos

- JavaScript interno: `const fechaInicio = evento.date_start;` (la propiedad de API se conserva en el límite hasta migrarla).
- SQL: `fecha_inicio`, `creado_en`.
- PHP: `$fecha_inicio`, `obtener_evento()`.
- Adaptador de API: recibe `date_start`, lo convierte a `fechaInicio` en el servicio y serializa la respuesta con el contrato acordado.

La migración de `title`, `description`, `location` y `created_at` se ejecuta por tabla, en fases aditivas. Mientras existan clientes con nombres antiguos, las columnas permanecen sincronizadas. No retirar las columnas viejas hasta validar conteos, equivalencia de datos y flujos de lectura/escritura en Express, XAMPP y administración.

## Alcance de adopción

Aplicar estas reglas a código nuevo y al código que se toque por una funcionalidad. Los renombrados existentes se hacen por capas con búsqueda de referencias, adaptación de contratos y pruebas de regresión; no hacer reemplazos globales ciegos.

## Autenticación durante la migración

- Los nombres internos nuevos son `contrasena`, `sesion` y `tokenActualizacion`; los nombres de usuario son `usuario`, `nombre`, `apellido` y `correo`.
- Las rutas existentes (`/api/auth/register`, `/login`, `/refresh`, etc.) no cambian. Las solicitudes aceptan temporalmente `contrasena` o `password`, y `tokenActualizacion`, `refreshToken` o `refresh_token`.
- Las respuestas de Express y XAMPP incluyen `tokenActualizacion` y conservan temporalmente `refreshToken`. Los clientes actuales pueden seguir usándolo durante la transición.
- Los alias históricos de esquemas, controladores y middlewares deben retirarse solo después de migrar frontend/XAMPP y comprobar que no quedan imports del nombre anterior.
- Los endpoints PHP de XAMPP aceptan temporalmente nombres viejos y nuevos en las solicitudes y agregan ambos nombres en respuestas JSON. Retirar aliases solo después de migrar frontend y clientes XAMPP.
