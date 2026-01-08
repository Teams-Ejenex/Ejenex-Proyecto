// src/js/modules/groups/groups.form.page.js
import { postAdminGroups, uploadGroupLogo } from "./groups.api.js";

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

/* ========= Logo preview ========= */
function initLogoPreview() {
  const input = document.getElementById("logo_file");
  const preview = document.getElementById("logo_preview");
  if (!input || !preview) return;

  input.addEventListener("change", () => {
    const file = input.files?.[0];
    if (!file) {
      preview.src = "";
      preview.style.display = "none";
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast("El archivo debe ser una imagen.", "error");
      input.value = "";
      preview.src = "";
      preview.style.display = "none";
      return;
    }

    const url = URL.createObjectURL(file);
    preview.src = url;
    preview.style.display = "block";
  });
}

/* ========= Init / Events ========= */
const form = document.getElementById("group-form");

if (!form) {
  console.warn("No se encontró #group-form en la página.");
} else {
  initLogoPreview();

  const btnAdd = document.getElementById("btn-add-social");
  if (btnAdd) btnAdd.addEventListener("click", addSocialRow);

  const socialContainer = document.getElementById("social-links");
  if (socialContainer) {
    socialContainer.addEventListener("click", (e) => {
      const target = e.target;
      if (target?.classList?.contains("btn-social-remove")) {
        target.closest(".social-row")?.remove();
        refreshRemoveButtons();
      }
    });
  }

  refreshRemoveButtons();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("nombre")?.value?.trim() ?? "";
    const short_description = document.getElementById("descripcion")?.value?.trim() ?? "";
    const email = document.getElementById("correo")?.value?.trim() ?? "";
    const category = document.getElementById("categoria")?.value?.trim() ?? "";

    if (!name || !short_description || !email || !category) {
      toast("Completa los campos obligatorios.", "error");
      return;
    }

    const social_links = readSocialLinks();

    const logoFile = document.getElementById("logo_file")?.files?.[0] ?? null;

    try {
      setLoading(true);

      let logo_url = null;
      if (logoFile) {
        logo_url = await uploadGroupLogo(logoFile);
      }

      const created = await postAdminGroups({
        name,
        short_description,
        email,
        logo_url,
        category,
        social_links,
        full_description: null,
      });

      toast("Grupo guardado correctamente ✅", "success");

      // (opcional) espera poquito para que se vea el toast
      setTimeout(() => {
        window.location.href = "../public/index.html";
        // si tu groups-create está en /src/pages/admin/ entonces ../public/index.html es correcto
      }, 700);

      form.reset();

      // Limpia preview
      const preview = document.getElementById("logo_preview");
      if (preview) {
        preview.src = "";
        preview.style.display = "none";
      }

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
