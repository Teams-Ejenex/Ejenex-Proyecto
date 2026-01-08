import { supabase } from "../../core/supabaseClient.js";

/**
 * Sube logo del grupo a Storage y regresa URL pública
 * Guarda en: group-logos/<groupId>/logo.<ext>
 */
export async function uploadGroupLogo(file, groupId) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("No hay sesión activa");
  if (!file) throw new Error("No se recibió archivo");
  if (!groupId) throw new Error("Falta groupId para guardar el logo");

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${groupId}/logo.${ext}`;

  const { error: upErr } = await supabase
    .storage
    .from("group-logos")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (upErr) throw new Error(upErr.message);

  const { data } = supabase.storage.from("group-logos").getPublicUrl(path);
  return data.publicUrl;
}