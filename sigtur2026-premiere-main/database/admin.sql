-- Ejecutar después de crear el usuario en Supabase Auth y public.usuarios.
-- Sustituí el correo por la cuenta real que administrará la página.
UPDATE public.usuarios
SET rol = 'admin'
WHERE correo = 'ADMIN_EMAIL_AQUI';