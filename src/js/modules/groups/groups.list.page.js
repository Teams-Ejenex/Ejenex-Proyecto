// src/js/modules/groups/groups.list.page.js
import { getGroups } from "./groups.api.js";

const navGroups = document.getElementById("navGroups");
const groupsSection = document.getElementById("groupsSection");
const groupsGrid = document.getElementById("groupsGrid");
const groupsEmpty = document.getElementById("groupsEmpty");
const groupsSearch = document.getElementById("groupsSearch");
const groupsCategory = document.getElementById("groupsCategory");

// opcional: si quieres esconder el hero / secciones cuando abres grupos
const heroSection = document.querySelector(".hero");
const featuredSection = document.querySelector(".grupos-section:not(#groupsSection)");

let allGroups = [];

function escapeHtml(str = "") {
  return str
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

    const socials = Array.isArray(g.social_links) ? g.social_links : [];
    const socialsHtml = socials.slice(0, 3).map(s => {
      const n = (s.network || "").toLowerCase();
      const u = s.url || "#";
      return `
        <a class="group-link" href="${u}" target="_blank" rel="noopener">
          <span>${socialIcon(n)}</span> ${escapeHtml(socialLabel(n))}
        </a>
      `;
    }).join("");

    return `
      <article class="group-card">
        <div class="group-head">
          <img class="group-logo" src="${logo || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' rx='16' fill='%23121b3a'/%3E%3Ctext x='40' y='48' text-anchor='middle' fill='%23ffffff' font-size='26' font-family='Arial'%3E%F0%9F%8E%93%3C/text%3E%3C/svg%3E"}" alt="Logo ${name}" />
          <div>
            <div class="group-title">${name}</div>
            ${cat ? `<div class="group-badge">${cat}</div>` : ""}
          </div>
        </div>

        <div class="group-desc">${desc}</div>

        <div class="group-actions">
          ${g.email ? `<a class="group-link" href="mailto:${escapeHtml(g.email)}">✉️ Correo</a>` : ""}
          ${socialsHtml}
        </div>
      </article>
    `;
  }).join("");
}

function applyFilters() {
  const q = (groupsSearch?.value || "").trim().toLowerCase();
  const cat = (groupsCategory?.value || "").trim();

  const filtered = allGroups.filter(g => {
    const matchesText =
      !q ||
      (g.name || "").toLowerCase().includes(q) ||
      (g.short_description || "").toLowerCase().includes(q);

    const matchesCat = !cat || (g.categoria || "") === cat;

    return matchesText && matchesCat;
  });

  render(filtered);
}

async function openGroups() {
  if (groupsSection) groupsSection.style.display = "block";

  // opcional: esconder otras secciones para que se vea como “vista”
  if (heroSection) heroSection.style.display = "none";
  if (featuredSection) featuredSection.style.display = "none";

  // si ya cargamos una vez, no vuelvas a pegarle a supabase
  if (allGroups.length) {
    applyFilters();
    return;
  }

  try {
    allGroups = await getGroups();
    applyFilters();
  } catch (err) {
    console.error(err);
    render([]);
  }
}

function init() {
  if (navGroups) {
    navGroups.addEventListener("click", (e) => {
      e.preventDefault();
      openGroups();
    });
  }

  if (groupsSearch) groupsSearch.addEventListener("input", applyFilters);
  if (groupsCategory) groupsCategory.addEventListener("change", applyFilters);
}

init();
