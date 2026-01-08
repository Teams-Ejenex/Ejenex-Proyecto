// src/js/modules/auth/auth.userMenu.js
import { supabase } from "../../core/supabaseClient.js";
import { getSession, isAdmin } from "../../core/auth.js";

// Rutas (relativas a src/pages/public/index.html)
const LOGIN_URL = "./login.html";
const PROFILE_URL = "../profile.html";
const PROFILE_EDIT_URL = "../profile-edit.html";
const GROUPS_CREATE_URL = "../admin/groups-create.html";

const userBtn = document.getElementById("userBtn");
const userFallback = document.getElementById("userFallback");
const userAvatar = document.getElementById("userAvatar");
const dropdown = document.getElementById("userDropdown");

const btnLogout = document.getElementById("btnLogout");
const btnViewProfile = document.getElementById("btnViewProfile");
const btnEditProfile = document.getElementById("btnEditProfile");
const btnCreateGroup = document.getElementById("btnCreateGroup");

function setFallbackLetter(letter = "U") {
  userAvatar.style.display = "none";
  userFallback.style.display = "inline";
  userFallback.textContent = (letter || "U").toUpperCase();
}

function setAvatar(url) {
  userAvatar.src = url;
  userAvatar.style.display = "block";
  userFallback.style.display = "none";
}

function closeDropdown() {
  dropdown.classList.remove("open");
}

function toggleDropdown() {
  dropdown.classList.toggle("open");
}

async function fetchMyProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, profile_picture_url")
    .eq("id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function initUserMenu() {
  if (!userBtn || !dropdown || !userFallback || !userAvatar) return;

  // Links base
  if (btnViewProfile) btnViewProfile.href = PROFILE_URL;
  if (btnEditProfile) btnEditProfile.href = PROFILE_EDIT_URL;

  if (btnCreateGroup) {
    btnCreateGroup.href = GROUPS_CREATE_URL;
    btnCreateGroup.hidden = true; // por default oculto
  }

  const session = await getSession();

  // NO sesión -> click manda a login
  if (!session?.user) {
    setFallbackLetter("U");
    closeDropdown();

    userBtn.onclick = () => {
      window.location.href = LOGIN_URL;
    };

    return;
  }

  // SÍ sesión -> carga avatar + habilita dropdown
  try {
    const p = await fetchMyProfile(session.user.id);

    const name = (p?.full_name || "").trim();
    const firstLetter = name ? name[0] : "U";

    if (p?.profile_picture_url) setAvatar(p.profile_picture_url);
    else setFallbackLetter(firstLetter);
  } catch (err) {
    console.warn("No se pudo leer profiles:", err.message);
    setFallbackLetter("U");
  }

  // Mostrar "Crear grupo" SOLO admins
  try {
    const ok = await isAdmin();
    if (btnCreateGroup) btnCreateGroup.hidden = !ok;
  } catch (err) {
    console.warn("No se pudo validar admin:", err.message);
    if (btnCreateGroup) btnCreateGroup.hidden = true;
  }

  // Dropdown handlers
  userBtn.onclick = (e) => {
    e.stopPropagation();
    toggleDropdown();
  };

  dropdown.addEventListener("click", (e) => e.stopPropagation());

  document.addEventListener("click", () => closeDropdown());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDropdown();
  });

  if (btnLogout) {
    btnLogout.onclick = async () => {
      await supabase.auth.signOut();
      closeDropdown();
      window.location.href = LOGIN_URL;
    };
  }
}

// Init + re-init en login/logout
initUserMenu();
supabase.auth.onAuthStateChange(() => initUserMenu());
