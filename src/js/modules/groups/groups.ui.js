/*
Archivo: groups.ui.js
Propósito:
Gestionar la interacción con el DOM del módulo Groups.

Uso futuro:
- Leer valores del formulario.
- Mostrar mensajes de éxito o error.
- Renderizar el listado de grupos.
- Mantener la UI separada de la lógica de negocio.
*/
import { postAdminGroups } from "./groups.api.js";

function readFormValues(form) {
  const name = form.querySelector("#nombre")?.value?.trim();
  const short_description = form.querySelector("#descripcion")?.value?.trim();
  const email = form.querySelector("#correo")?.value?.trim();
  const logo_url = form.querySelector("#logo")?.value?.trim();

  // categoría (por ahora NO se manda a BD si no existe columna)
  const category = form.querySelector("#categoria")?.value?.trim();

  // Redes -> JSONB
  const red = form.querySelector("#redes")?.value?.trim();
  const url = form.querySelector("#urlRedes")?.value?.trim();

  const social_links = (red && url)
    ? { [red]: url }
    : null;

  return {
    name,
    short_description,
    email,
    logo_url: logo_url || null,
    social_links,
    // Guardamos category por si luego agregas columna
    category: category || null,
  };
}

function validate(values) {
  if (!values.name) return "El Nombre del Grupo es obligatorio.";
  if (!values.short_description) return "La Descripción Breve es obligatoria.";

  const correoRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!values.email || !correoRegex.test(values.email)) {
    return "Ingresa un correo electrónico válido.";
  }

  // Si selecciona red, debe haber URL
  if (values.social_links) {
    const key = Object.keys(values.social_links)[0];
    const value = values.social_links[key];
    if (!value) return "Si eliges una red social, agrega la URL.";
  }

  return null;
}

export function initGroupCreateForm() {
  const form = document.querySelector("#groupForm") || document.querySelector("form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const values = readFormValues(form);
    const errorMsg = validate(values);
    if (errorMsg) {
      alert(errorMsg);
      return;
    }

    try {
      const inserted = await postAdminGroups(values);
      alert("Grupo guardado ✅");
      console.log("Insert OK:", inserted);
      form.reset();
    } catch (err) {
      const msg = err?.message ?? String(err);
      alert("Error al guardar: " + msg);
      console.error(err);
    }
  });
}
