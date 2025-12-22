/*
Archivo: groups.api.js
Propósito:
Encapsular todas las llamadas HTTP relacionadas con grupos.

Uso futuro:
- POST /admin/groups para crear grupos.
- GET /admin/groups para listar grupos.
- Manejo centralizado de errores HTTP.
- Evitar lógica de fetch directamente en la UI.
*/

import { supabase } from "../../core/supabaseClient.js";

export async function postAdminGroups(data) {
  const { data: inserted, error } = await supabase
    .from("groups")
    .insert([{
      name: data.name,
      short_description: data.short_description,
      full_description: data.full_description ?? null,
      email: data.email ?? null,
      social_links: data.social_links ?? null,
      logo_url: data.logo_url ?? null,
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

// Crear endpoint POST
import { createGroupController } from './groups.controller.js';
import { isAdmin } from '../../core/auth.js';

/*export async function postAdminGroups(data) {
  if (!isAdmin()) {
    throw new Error('Acceso denegado: solo administradores');
  }

  return await createGroupController(data);
}*/
