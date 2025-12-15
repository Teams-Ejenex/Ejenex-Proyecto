/*
Archivo: groups.schema.js
Propósito:
Definir las reglas de validación del formulario de grupos en el frontend.

Uso futuro:
- Validar campos obligatorios (nombre, descripción).
- Verificar formatos (correo electrónico).
- Mantener las reglas desacopladas de la UI.
- Alinear validaciones frontend con backend.
*/

//Validaciones server-side
export function validateGroupSchema(group) {
  const errors = [];

  if (!group.name || group.name.trim() === '') {
    errors.push('El nombre del grupo es obligatorio');
  }

  if (!group.short_description || group.short_description.trim() === '') {
    errors.push('La descripción corta es obligatoria');
  }

  if (group.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(group.email)) {
      errors.push('Correo electrónico no válido');
    }
  }

  return errors;
}
