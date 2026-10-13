import supabase from "../config/supabase.js";

export async function listarCompanias() {
  const { data, error } = await supabase.from("busines").select("*").order("name");
  if (error) throw error;
  return data;
}
