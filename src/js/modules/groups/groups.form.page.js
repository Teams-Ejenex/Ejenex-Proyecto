// src/js/modules/groups/groups.form.page.js
import { postAdminGroups } from "./groups.api.js";

/* ========= Toasts ========= */
function toast(msg, type = "info") {
  const colors = {
    success: "linear-gradient(90deg, #22c55e, #16a34a)",
    error: "linear-gradient(90deg, #ef4444, #b91c1c)",
    info: "linear-gradient(90deg, #3b82f6, #2563eb)",
  };

  Toastify({
    text: msg,
    duration: 3500,
    close: true,
    gravity: "top",
    position: "right",
    stopOnFocus: true,
    style: { background: colors[type] ?? colors.info },
  }).showToast();
}

/* ========= UI helpers ========= */
function setLoading(isLoading) {
  const btn = document.getElementById("btn-submit");
  if (!btn) return;

  btn.disabled = isLoading;
  btn.textContent = isLoading ? "Guardando..." : "Guardar Grupo";
}

function refreshRemoveButtons() {
  const rows = document.querySelectorAll("#social-links .social-row");
  rows.forEach((row) => {
    const btn = row.querySelector(".btn-social-remove");
    if (!btn) return;
    btn.style.display = rows.length > 1 ? "inline-flex" : "none";
  });
}

/* ========= Social Links (multi) ========= */
function addSocialRow() {
  const container = document.getElementById("social-links");
  if (!container) return;

  const row = document.createElement("div");
  row.className = "social-input social-row";

  row.innerHTML = `
    <select class="social-network">
      <option value="">(opcional) Selecciona una red</option>
      <option value="instagram">Instagram</option>
      <option value="facebook">Facebook</option>
      <option value="twitter">Twitter</option>
      <option value="tiktok">TikTok</option>
      <option value="youtube">YouTube</option>
    </select>

    <input type="url" class="social-url" placeholder="https://..." />

    <button type="button" class="btn-social-remove" title="Eliminar">✕</button>
  `;

  container.appendChild(row);
  refreshRemoveButtons();
}

function readSocialLinks() {
  const rows = Array.from(document.querySelectorAll("#social-links .social-row"));

  const socialLinks = rows
    .map((row) => {
      const network = row.querySelector(".social-network")?.value?.trim() ?? "";
      const url = row.querySelector(".social-url")?.value?.trim() ?? "";

      if (!network || !url) return null;

      return { network, url };
    })
    .filter(Boolean);

  return socialLinks.length ? socialLinks : null;
}

/* ========= Init / Events ========= */
const form = document.getElementById("group-form");
if (!form) {
  console.warn("No se encontró #group-form en la página.");
} else {
  const btnAdd = document.getElementById("btn-add-social");
  if (btnAdd) {
    btnAdd.addEventListener("click", addSocialRow);
  } else {
    console.warn("No se encontró #btn-add-social (botón +).");
  }

  const socialContainer = document.getElementById("social-links");
  if (socialContainer) {
    socialContainer.addEventListener("click", (e) => {
      const target = e.target;
      if (target?.classList?.contains("btn-social-remove")) {
        target.closest(".social-row")?.remove();
        refreshRemoveButtons();
      }
    });
  } else {
    console.warn("No se encontró #social-links (contenedor de redes).");
  }

  refreshRemoveButtons();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("nombre")?.value?.trim() ?? "";
    const short_description = document.getElementById("descripcion")?.value?.trim() ?? "";
    const email = document.getElementById("correo")?.value?.trim() ?? "";
    const logo_url = (document.getElementById("logo")?.value?.trim() ?? "") || null;

    const category = document.getElementById("categoria")?.value?.trim() ?? "";

    if (!name || !short_description || !email || !category) {
      toast("Completa los campos obligatorios.", "error");
      return;
    }

    const social_links = readSocialLinks();

    try {
      setLoading(true);

      const created = await postAdminGroups({
        name,
        short_description,
        email,
        logo_url,
        category,       
        social_links,   
        full_description: null,
      });

      toast("Grupo guardado correctamente", "success");
      form.reset();

      console.log("Grupo creado:", created);
    } catch (err) {
      console.error(err);
      toast(`No se pudo guardar: ${err.message}`, "error");
    } finally {
      setLoading(false);
      refreshRemoveButtons();
    }
  });
}