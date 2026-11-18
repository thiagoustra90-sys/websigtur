import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const url = String(process.env.SUPABASE_URL || "").trim();
const serviceKey = String(process.env.SUPABASE_SERVICE_KEY || "").trim();

if (!url || !/^https?:\/\//i.test(url)) {
  throw new Error("SUPABASE_URL no está configurada correctamente.");
}

if (!serviceKey || /tu-service-role-key-aqui|changeme/i.test(serviceKey)) {
  throw new Error("SUPABASE_SERVICE_KEY no está configurada correctamente.");
}

const supabase = createClient(url, serviceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

export default supabase;