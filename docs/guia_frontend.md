# Guía práctica del frontend

Esta guía sirve para encontrar rápido dónde hacer un cambio y qué otras partes conviene revisar antes de darlo por terminado.

## Dónde vive cada parte

- `frontend/html/` contiene las páginas del sitio. En varias hay una versión `.html` para Render y otra `.php` para XAMPP. Si cambias el contenido compartido, mantené ambas versiones alineadas; algunas rutas y formularios sí varían según el entorno.
- `frontend/js/main.js` reúne el comportamiento compartido y prepara cada página según la clase de su `<body>`.
- `frontend/js/mapa.js` contiene la interacción del mapa; `frontend/js/comment-media.js` se ocupa de los archivos adjuntos a comentarios.
- `frontend/js/api-config.js` indica cómo encontrar la API y configura los recursos públicos que usa el navegador. Las claves secretas pertenecen a `backend/.env`, nunca al frontend.
- `frontend/css/styles.css` concentra la navegación, los temas y buena parte de los estilos compartidos. `profile.css`, `support-events.css`, `mapa.css`, `turismo-ui.css` y `comment-media.css` agrupan estilos de esas áreas.

## Al cambiar una página

Primero ubicá el marcado y seguí las clases o los identificadores que usa JavaScript. Después revisá los estilos compartidos: `styles.css` tiene reglas antiguas por página y ajustes comunes que se aplican más abajo en la cascada. Si una regla nueva parece no tener efecto, buscá si otra regla posterior o el tema activo la está reemplazando.

Cuando el cambio afecte una página disponible en `.html` y `.php`, comprobá que ambas conserven el mismo contenido y las mismas clases. Mantené las diferencias de rutas que necesita cada entorno.

También conviene revisar el modo claro, el modo oscuro y el ancho móvil. Los cambios de color suelen depender de `body.tema-oscuro`; los estilos de cada sección se limitan, cuando corresponde, con la clase de página del `<body>`.

## Cómo dejar comentarios útiles

Un comentario ayuda cuando explica una dependencia, una decisión o un comportamiento que no se entiende leyendo la línea siguiente. Por ejemplo: «El servidor confirma el rol antes de mostrar los controles de administración». No hace falta comentar que una función es `async` o repetir el nombre de un botón; el comentario debería contar por qué ese detalle importa.
