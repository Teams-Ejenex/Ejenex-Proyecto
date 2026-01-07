/*
Archivo: groups.api.js
Propósito:
Encapsular todas las llamadas a Supabase relacionadas con grupos.

Uso futuro:
- Crear grupos (solo admin).
- Listar grupos (público).
- Centralizar acceso a la tabla "groups".
*/

import { supabase } from "../../core/supabaseClient.js";
import { isAdmin } from "../../core/auth.js";

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
      categoria: data.category,         
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
