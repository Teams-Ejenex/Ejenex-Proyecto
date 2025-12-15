/*
Archivo: groups.controller.js
Propósito:
Controlador principal del módulo Groups.
Orquesta el flujo entre la interfaz, validaciones y llamadas a la API.

Uso futuro:
- Coordinar la creación de grupos.
- Manejar eventos del formulario (submit).
- Decidir cuándo llamar a la API o mostrar errores.
- Mantener la lógica separada de la UI.
*/

//Generación de UUID
function generateUUID() {
  return crypto.randomUUID();
}

//Lógica de permisos base
function buildBasePermissions(groupId) {
  return {
    group_id: groupId,
    can_view_profile: true,
    can_manage_own_data: true
  };
}

//Persistencia en base de datos
import { validateGroupSchema } from './groups.schema.js';

export async function createGroupController(data) {
  const errors = validateGroupSchema(data);
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }

  const response = await fetch('../../data/grupos.json');
  const groups = await response.json();

  const now = new Date().toISOString();
  const groupId = crypto.randomUUID();

  const newGroup = {
    id: groupId,
    name: data.name,
    short_description: data.short_description,
    full_description: data.full_description || '',
    email: data.email || '',
    social_links: data.social_links || {},
    logo_url: '',
    created_at: now,
    updated_at: now,
    created_by_admin: 'admin-001'
  };

  groups.push(newGroup);

  localStorage.setItem('groups_db', JSON.stringify(groups));

  const permissions = buildBasePermissions(groupId);

  return {
    success: true,
    message: 'Grupo creado exitosamente',
    group: newGroup,
    permissions
  };
}
