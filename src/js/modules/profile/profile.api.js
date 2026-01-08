// src/js/modules/profile/profile.api.js
import { supabase } from "../../core/supabaseClient.js";

/**
 * Trae el perfil del usuario logueado desde public.profiles
 */
export async function getMyProfile() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("No hay sesión activa");

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, career, interests, favorite_groups, profile_picture_url, role, updated_at, created_at")
    .eq("id", session.user.id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Actualiza (parcial) el perfil del usuario logueado
 */
export async function updateMyProfile(payload) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("No hay sesión activa");

  const { error } = await supabase
    .from("profiles")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", session.user.id);

  if (error) throw new Error(error.message);
}

/**
 * Sube imagen a Storage y regresa URL pública
 */
export async function uploadMyProfilePicture(file) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("No hay sesión activa");
  if (!file) throw new Error("No se recibió archivo");

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${session.user.id}/avatar.${ext}`;

  const { error: upErr } = await supabase
    .storage
    .from("profile-pictures")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (upErr) throw new Error(upErr.message);

  const { data } = supabase.storage.from("profile-pictures").getPublicUrl(path);
  return data.publicUrl;
}
