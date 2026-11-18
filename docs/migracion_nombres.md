# Migración segura de nombres

## Regla de avance

Migrar un módulo por vez. Antes de tocarlo, ejecutar `npm --prefix backend test` y conservar sus pruebas de contrato. Durante la transición, validar en el límite de entrada los nombres nuevos y antiguos; las respuestas públicas incluyen ambos aliases. No retirar un alias mientras frontend, XAMPP u otro consumidor lo use.

Después de cambiar un módulo:

1. Ejecutar los tests de contrato del módulo y todo `npm --prefix backend test`.
2. Comprobar que las rutas HTTP, permisos, claves JSON y estructura de respuestas actuales no cambiaron.
3. Revisar referencias en Express, frontend, PHP/XAMPP y SQL.
4. Desplegar y observar el módulo antes de continuar con el siguiente.

## Orden

1. **Autenticación:** registro, inicio, recuperación, renovación, cierre de sesión, perfil validado y aliases de contraseña/token.
2. **Eventos:** validación, altas/ediciones administrativas, listado, mapa y campos SQL `title/titulo`, `description/descripcion`, `location/ubicacion`.
3. **Comentarios y likes:** comentarios, respuestas, medios, reportes y estado de likes/guardados.
4. **Mensajes:** conversaciones, adjuntos, audio, lectura y eliminación.
5. **Perfil y administración:** perfil, métricas, configuración, avisos, tickets, usuarios y actividad.
6. **Mapa y chatbot:** puntos de catálogo y contrato RPC de conocimiento vectorial.

## Cobertura base

`backend/test/auth.test.js` verifica los nombres de autenticación anteriores y nuevos. `backend/test/contratos_modulos.test.js` fija los contratos existentes para eventos, comentarios/likes, mensajes, perfil/administración, mapa y la función SQL pública del chatbot. Al migrar cada módulo, ampliar sus tests para comprobar lectura/escritura en español además de los aliases antiguos antes de pasar al siguiente.

Las migraciones SQL de columnas son aditivas y mantienen doble escritura. Las columnas antiguas se eliminan solo en una fase posterior, luego de verificar datos y confirmar que no quedan consumidores.
