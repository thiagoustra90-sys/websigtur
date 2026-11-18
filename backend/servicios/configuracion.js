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
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV === "production" && !allowedOrigins.length) {
    throw new Error("ALLOWED_ORIGINS o FRONTEND_ORIGIN deben configurarse en producción.");
  }

  if (process.env.NODE_ENV === "production") {
    const frontOrigin = String(process.env.FRONTEND_ORIGIN || "").trim();
    const frontUrl = String(process.env.FRONTEND_URL || "").trim();
    const recoveryUrl = String(process.env.PASSWORD_RESET_REDIRECT_URL || "").trim();
    try {
      const origin = new URL(frontOrigin);
      const login = new URL(frontUrl);
      const recovery = new URL(recoveryUrl);
      if (
        origin.protocol !== "https:" ||
        login.origin !== origin.origin ||
        recovery.origin !== origin.origin
      ) {
        throw new Error(
          "Frontend and recovery URLs must use the public frontend origin over HTTPS.",
        );
      }
      if (!login.pathname.endsWith("/login.html") || !recovery.pathname.endsWith("/login.html")) {
        throw new Error("Configure FRONTEND_URL and PASSWORD_RESET_REDIRECT_URL to /login.html.");
      }
    } catch (error) {
      throw new Error(`Invalid OAuth or recovery redirect configuration: ${error.message}`);
    }
  }
}
