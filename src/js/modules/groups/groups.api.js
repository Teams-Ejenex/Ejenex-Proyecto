// src/js/modules/groups/groups.api.js
import { supabase } from "../../core/supabaseClient.js";
import { isAdmin } from "../../core/auth.js";

/**
 * Sube logo a Storage y regresa URL pública
 * Bucket: group-logos (public)
 * Path: <userId>/<random>.<ext>
 */
export async function uploadGroupLogo(file) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("No hay sesión activa");
  if (!file) throw new Error("No se recibió archivo");

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const safeExt = ["png", "jpg", "jpeg", "webp"].includes(ext) ? ext : "png";

  const name = `${crypto.randomUUID()}.${safeExt}`;
  const path = `${session.user.id}/${name}`;

  const { error: upErr } = await supabase
    .storage
    .from("group-logos")
    .upload(path, file, { upsert: false, contentType: file.type });

  if (upErr) throw new Error(upErr.message);

  const { data } = supabase.storage.from("group-logos").getPublicUrl(path);
  return data.publicUrl;
}

export async function postAdminGroups(data) {
  const ok = await isAdmin();
  if (!ok) throw new Error("Acceso denegado: solo administradores");

  const { data: inserted, error } = await supabase
    .from("groups")
    .insert([{
      name: data.name,
      short_description: data.short_description,
      full_description: data.full_description ?? null,
      email: data.email ?? null,
      logo_url: data.logo_url ?? null,
      categoria: data.category,         // tu columna se llama "categoria"
      social_links: data.social_links ?? null,
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return inserted;
}

export async function getGroups() {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}
