import { supabase } from "../../core/supabaseClient.js";

export async function getForums() {
  const { data, error } = await supabase
    .from("forums")
    .select("id, name, description, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createForum({ name, description }) {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData?.session?.user) throw new Error("Inicia sesión para crear foros.");

  const { data, error } = await supabase
    .from("forums")
    .insert([{ name, description: description ?? null }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
