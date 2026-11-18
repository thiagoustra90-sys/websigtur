# Migraciones operativas

Aplicar en orden los archivos SQL versionados de `migrations/` con Supabase CLI (`supabase db push`) o el flujo controlado del proyecto. En una instalación ya puesta al día hasta `20261117000700_admin_audit.sql`, aplicar obligatoriamente `20261118000100_soporte_administracion.sql` para habilitar tickets, ajustes, avisos y actividad persistentes. No ejecutar manualmente el mismo archivo más de una vez; sus objetos usan `IF NOT EXISTS` para permitir despliegues repetibles, pero el historial de migraciones sigue siendo la fuente de verdad.

Los datos de demostración deben vivir en `supabase/seed.sql` (o scripts de seed del entorno), nunca en estos archivos de migración.

Para habilitar reservas persistentes y planes turísticos, aplicar también `20261118000200_planes_reservas_archivos.sql`.

Para recibir y administrar solicitudes estructuradas de verificacion de empresas y organizaciones, aplicar tambien `20261118000300_solicitudes_verificacion.sql`. Esta migracion agrega el tipo de ticket, sus datos estructurados y el indice que usa el filtro administrativo.
