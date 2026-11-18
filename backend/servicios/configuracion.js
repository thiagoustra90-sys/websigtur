export function validarConfiguracionInicio() {
  const url = String(process.env.SUPABASE_URL || "").trim();
  const serviceKey = String(process.env.SUPABASE_SERVICE_KEY || "").trim();

  if (!/^https:\/\//i.test(url) && process.env.NODE_ENV === "production") {
    throw new Error("SUPABASE_URL debe usar HTTPS en producción.");
  }
  if (!url) throw new Error("SUPABASE_URL no está configurada.");
  if (!serviceKey || /tu-service-role-key-aqui|changeme/i.test(serviceKey)) {
    throw new Error("SUPABASE_SERVICE_KEY no está configurada.");
  }

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_ORIGIN || "")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV === "production" && !allowedOrigins.length) {
    throw new Error("ALLOWED_ORIGINS o FRONTEND_ORIGIN deben configurarse en producción.");
  }
}
