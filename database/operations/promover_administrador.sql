-- Ejecutar manualmente con el correo real de la cuenta autorizada.
-- No pongas el correo directamente en archivos versionados ni en el frontend.
DO $$
DECLARE
  admin_count integer;
  admin_email text := '<CONFIGURAR_CORREO_ADMIN_REAL>'; -- Reemplazar antes de ejecutar.
BEGIN
  IF admin_email = '<CONFIGURAR_CORREO_ADMIN_REAL>' THEN
    RAISE EXCEPTION 'Debes configurar el correo del administrador antes de ejecutar esta migración.';
  END IF;

  UPDATE public.usuarios
  SET rol = 'admin'
  WHERE correo = lower(admin_email);

  GET DIAGNOSTICS admin_count = ROW_COUNT;
  IF admin_count <> 1 THEN
    RAISE EXCEPTION 'Se esperaba exactamente una cuenta administrativa, se encontraron %.', admin_count;
  END IF;
END $$;
