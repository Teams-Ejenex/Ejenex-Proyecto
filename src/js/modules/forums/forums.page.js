import { supabase } from "../../core/supabaseClient.js";
import { isAdmin } from "../../core/auth.js";
import { getForums, createForum } from "./forums.api.js";

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

const grid = document.getElementById("grid");
const empty = document.getElementById("empty");
const loading = document.getElementById("loading");
const search = document.getElementById("search");
const btnNewForum = document.getElementById("btnNewForum");

const modalBackdrop = document.getElementById("modalBackdrop");
const forumName = document.getElementById("forumName");
const forumDesc = document.getElementById("forumDesc");
const btnCancel = document.getElementById("btnCancel");
const btnCreate = document.getElementById("btnCreate");

let all = [];

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function openModal() { modalBackdrop.style.display = "flex"; }
function closeModal() { modalBackdrop.style.display = "none"; }

function render(list) {
  if (!list.length) {
    grid.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  grid.innerHTML = list.map(f => `
    <article class="card" data-id="${f.id}">
      <div class="title">${escapeHtml(f.name)}</div>
      <div class="desc">${escapeHtml(f.description || "Sin descripción")}</div>
    </article>
  `).join("");

  // click -> abrir foro
  grid.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-id");
      window.location.href = `./forum.html?forum_id=${encodeURIComponent(id)}`;
    });
  });
}

function applyFilter() {
  const q = (search.value || "").trim().toLowerCase();
  const filtered = all.filter(f =>
    !q ||
    (f.name || "").toLowerCase().includes(q) ||
    (f.description || "").toLowerCase().includes(q)
  );
  render(filtered);
}

async function initAdminButton() {
  try {
    const ok = await isAdmin();
    btnNewForum.hidden = !ok;
  } catch {
    btnNewForum.hidden = true;
  }
}

async function load() {
  loading.style.display = "block";
  empty.style.display = "none";
  grid.innerHTML = "";

  try {
    all = await getForums();
    applyFilter();
  } catch (e) {
    console.error(e);
    toast("No se pudieron cargar los foros (RLS o conexión).", "error");
    all = [];
    render([]);
  } finally {
    loading.style.display = "none";
  }
}

btnNewForum?.addEventListener("click", () => {
  forumName.value = "";
  forumDesc.value = "";
  openModal();
});

btnCancel?.addEventListener("click", closeModal);
modalBackdrop?.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeModal();
});

btnCreate?.addEventListener("click", async () => {
  const name = (forumName.value || "").trim();
  const description = (forumDesc.value || "").trim() || null;

  if (!name) {
    toast("El nombre del foro es obligatorio.", "error");
    return;
  }

  try {
    await createForum({ name, description });
    toast("Foro creado ✅", "success");
    closeModal();
    await load();
  } catch (e) {
    console.error(e);
    toast(e.message || "No se pudo crear el foro.", "error");
  }
});

search?.addEventListener("input", applyFilter);

// Init
await initAdminButton();
await load();

// opcional: refrescar si cambian auth
supabase.auth.onAuthStateChange(() => {
  initAdminButton();
});
