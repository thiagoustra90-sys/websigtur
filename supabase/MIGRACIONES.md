# Migraciones operativas

Aplicar en orden los archivos SQL versionados de `migrations/` con Supabase CLI (`supabase db push`) o el flujo controlado del proyecto. En una instalación ya puesta al día hasta `20261117000700_admin_audit.sql`, aplicar obligatoriamente `20261118000100_soporte_administracion.sql` para habilitar tickets, ajustes, avisos y actividad persistentes. No ejecutar manualmente el mismo archivo más de una vez; sus objetos usan `IF NOT EXISTS` para permitir despliegues repetibles, pero el historial de migraciones sigue siendo la fuente de verdad.

Los datos de demostración deben vivir en `supabase/seed.sql` (o scripts de seed del entorno), nunca en estos archivos de migración.

Para habilitar reservas persistentes y planes turísticos, aplicar también `20261118000200_planes_reservas_archivos.sql`.

Para recibir y administrar solicitudes estructuradas de verificacion de empresas y organizaciones, aplicar tambien `20261118000300_solicitudes_verificacion.sql`. Esta migracion agrega el tipo de ticket, sus datos estructurados y el indice que usa el filtro administrativo.

## Renombrado gradual de columnas del catálogo

Aplicar en orden las migraciones `20261118000400` a `20261118001200`: eventos, lugares, empresas, conocimiento, función de sincronización y, por separado, perfiles, interacciones, administración y reservas. Cada archivo corresponde a una tabla o grupo funcional; agrega y backfillea las columnas en español con triggers de compatibilidad de doble escritura. El backend actual continúa usando los nombres antiguos y seguirá funcionando durante esta fase. Son obligatorias antes de desplegar código que escriba los nombres en español.

No eliminar `title`, `description`, `location` ni `created_at` en esta fase. Primero migrar las lecturas y escrituras de la aplicación, comprobar conteos y valores entre cada pareja de columnas, y validar creación/edición desde Express, XAMPP y administración. La eliminación requiere una migración posterior e independiente, después de confirmar que no quedan clientes ni consultas usando los nombres anteriores.
