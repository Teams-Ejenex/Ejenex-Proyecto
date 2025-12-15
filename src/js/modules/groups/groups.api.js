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

// Crear endpoint POST
import { createGroupController } from './groups.controller.js';
import { isAdmin } from '../../core/auth.js';

export async function postAdminGroups(data) {
  if (!isAdmin()) {
    throw new Error('Acceso denegado: solo administradores');
  }

  return await createGroupController(data);
}
