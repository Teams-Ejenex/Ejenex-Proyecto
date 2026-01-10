// src/js/modules/groups/groups.page.js

let supabase;

const bannerError = document.getElementById("bannerError");
function showBanner(msg) {
  if (!bannerError) return;
  bannerError.textContent = msg;
  bannerError.style.display = "block";
}

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function socialLabel(network) {
  const map = {
    instagram: "Instagram",
    facebook: "Facebook",
    twitter: "X/Twitter",
    tiktok: "TikTok",
    youtube: "YouTube",
  };
  return map[network] || network;
}

function socialIcon(network) {
  const map = {
    instagram: "📷",
    facebook: "📘",
    twitter: "𝕏",
    tiktok: "🎵",
    youtube: "▶️",
  };
  return map[network] || "🔗";
}

const fallbackLogo =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' rx='16' fill='%23121b3a'/%3E%3Ctext x='40' y='48' text-anchor='middle' fill='%23ffffff' font-size='26' font-family='Arial'%3E%F0%9F%8E%93%3C/text%3E%3C/svg%3E";

/* ===== DOM ===== */
const groupsGrid = document.getElementById("groupsGrid");
const groupsEmpty = document.getElementById("groupsEmpty");
const groupsLoading = document.getElementById("groupsLoading");
const groupsSearch = document.getElementById("groupsSearch");
const groupsCategory = document.getElementById("groupsCategory");

/* ===== Modal DOM ===== */
const groupModalBackdrop = document.getElementById("groupModalBackdrop");
const groupModalClose = document.getElementById("groupModalClose");
const groupModalTitle = document.getElementById("groupModalTitle");
const groupModalCategory = document.getElementById("groupModalCategory");
const groupModalLogo = document.getElementById("groupModalLogo");
const groupModalDesc = document.getElementById("groupModalDesc");
const groupModalEmail = document.getElementById("groupModalEmail");
const groupModalSocialWrap = document.getElementById("groupModalSocialWrap");
const groupModalSocial = document.getElementById("groupModalSocial");

let allGroups = [];

function render(groups) {
  if (!groupsGrid) return;

  if (!groups?.length) {
    groupsGrid.innerHTML = "";
    if (groupsEmpty) groupsEmpty.style.display = "block";
    return;
  }

  if (groupsEmpty) groupsEmpty.style.display = "none";

  groupsGrid.innerHTML = groups.map(g => {
    const name = escapeHtml(g.name || "Grupo");
    const cat = escapeHtml(g.categoria || "");
    const desc = escapeHtml(g.short_description || "");
    const logo = g.logo_url || "";

    return `
      <article class="group-card" data-group-id="${escapeHtml(String(g.id))}">
        <div class="group-head">
          <img class="group-logo" src="${logo || fallbackLogo}" alt="Logo ${name}" />
          <div>
            <div class="group-title">${name}</div>
            ${cat ? `<div class="group-badge">${cat}</div>` : ""}
          </div>
        </div>

        <div class="group-desc">${desc}</div>

        <div class="group-actions">
          ${
            g.email
              ? `<a class="group-link" href="mailto:${escapeHtml(g.email)}" onclick="event.stopPropagation()">✉️ Correo</a>`
              : ""
          }
        </div>
      </article>
    `;
  }).join("");
}

function applyFilters() {
  const q = (groupsSearch?.value || "").trim().toLowerCase();
  const cat = (groupsCategory?.value || "").trim();

  const filtered = allGroups.filter(g => {
    const okText =
      !q ||
      (g.name || "").toLowerCase().includes(q) ||
      (g.short_description || "").toLowerCase().includes(q);

    const okCat = !cat || (g.categoria || "") === cat;
    return okText && okCat;
  });

  render(filtered);
}

async function loadGroups() {
  if (groupsLoading) groupsLoading.style.display = "block";
  if (groupsEmpty) groupsEmpty.style.display = "none";
  if (groupsGrid) groupsGrid.innerHTML = "";

  const { data, error } = await supabase
    .from("groups")
    .select("id, name, short_description, full_description, email, logo_url, categoria, social_links, created_at")
    .order("created_at", { ascending: false });

  if (groupsLoading) groupsLoading.style.display = "none";

  if (error) {
    console.error("Error cargando groups:", error.message);
    showBanner("No se pudieron cargar los grupos. Revisa consola (RLS o query).");
    allGroups = [];
    render([]);
    return;
  }

  allGroups = data || [];
  applyFilters();
}

/* ===== Modal ===== */
function openGroupModal(group) {
  if (!groupModalBackdrop) return;

  groupModalTitle.textContent = group?.name ?? "Grupo";
  groupModalCategory.textContent = group?.categoria ?? "Sin categoría";

  const desc = group?.full_description || group?.short_description || "";
  groupModalDesc.textContent = desc;

  const logo = group?.logo_url || "";
  groupModalLogo.src = logo || fallbackLogo;
  groupModalLogo.style.display = "block";

  const email = group?.email || "";
  if (email) {
    groupModalEmail.href = `mailto:${email}`;
    groupModalEmail.style.display = "inline-block";
  } else {
    groupModalEmail.href = "#";
    groupModalEmail.style.display = "none";
  }

  const links = Array.isArray(group?.social_links) ? group.social_links : [];
  groupModalSocial.innerHTML = "";

  if (links.length) {
    groupModalSocialWrap.style.display = "block";
    links.forEach(({ network, url }) => {
      if (!network || !url) return;
      const n = String(network).toLowerCase();

      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = `${socialIcon(n)} ${socialLabel(n)}`;
      groupModalSocial.appendChild(a);
    });
  } else {
    groupModalSocialWrap.style.display = "none";
  }

  groupModalBackdrop.classList.add("open");
  groupModalBackdrop.setAttribute("aria-hidden", "false");
}

function closeGroupModal() {
  if (!groupModalBackdrop) return;
  groupModalBackdrop.classList.remove("open");
  groupModalBackdrop.setAttribute("aria-hidden", "true");
}

function initModal() {
  groupModalClose?.addEventListener("click", closeGroupModal);

  groupModalBackdrop?.addEventListener("click", (e) => {
    if (e.target === groupModalBackdrop) closeGroupModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeGroupModal();
  });

  groupsGrid?.addEventListener("click", (e) => {
    const card = e.target.closest("[data-group-id]");
    if (!card) return;

    const id = card.getAttribute("data-group-id");
    const group = allGroups.find(g => String(g.id) === String(id));
    if (group) openGroupModal(group);
  });
}

/* ===== Init ===== */
async function boot() {
  try {
    ({ supabase } = await import("../../core/supabaseClient.js"));
  } catch (e) {
    console.error(e);
    showBanner("No se pudo cargar supabaseClient.js. Revisa la ruta del import en groups.html.");
    return;
  }

  groupsSearch?.addEventListener("input", applyFilters);
  groupsCategory?.addEventListener("change", applyFilters);

  initModal();
  await loadGroups();
}

boot();
