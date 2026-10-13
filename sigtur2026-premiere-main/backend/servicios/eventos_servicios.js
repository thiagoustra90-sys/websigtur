import supabase from "../config/supabase.js";

export async function listarEventos() {
  const { data, error } = await supabase.from("events").select("*").order("date_start", { ascending: true });
  if (error) throw error;
  return data;
}
