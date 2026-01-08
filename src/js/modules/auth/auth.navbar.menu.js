// src/js/modules/auth/auth.navbar.menu.js
import { supabase } from "../../core/supabaseClient.js";

const userBtn = document.getElementById("userBtn");
const userFallback = document.getElementById("userFallback");
const userAvatar = document.getElementById("userAvatar");

const dropdown = document.getElementById("userDropdown");
const btnLogout = document.getElementById("btnLogout");

const LOGIN_URL = "../public/login.html";      // ajusta si tu ruta cambia
const PROFILE_URL = "../profile.html";         // placeholder
const PROFILE_EDIT_URL = "../profile-edit.html";

function openDropdown() {
  dropdown.classList.add("open");
}

function closeDropdown() {
  dropdown.classList.remove("open");
}

function toggleDropdown() {
  dropdown.classList.toggle("open");
}

async function loadAvatar(userId) {
  // Busca el perfil
  const { data, error } = await supabase
    .from("profiles")
    .select("profile_picture_url, full_name")
    .eq("id", userId)
    .single();

  if (error) {
    console.warn("No se pudo leer profiles:", error.message);
    return;
  }

  const url = data?.profile_picture_url;

  // Si hay URL de foto, ponemos imagen
  if (url) {
    userAvatar.src = url;
    userAvatar.style.display = "block";
    userFallback.style.display = "none";
  } else {
    userAvatar.style.display = "none";
    userFallback.style.display = "inline";
  }

  // (Opcional) letra fallback basada en nombre
  const name = (data?.full_name || "").trim();
  if (!url && name) userFallback.textContent = name[0].toUpperCase();
}

async function initUserMenu() {
  const { data: sessionRes } = await supabase.auth.getSession();
  const session = sessionRes?.session;

  // Si NO hay sesión: botón manda a login
  if (!session?.user) {
    userAvatar.style.display = "none";
    userFallback.style.display = "inline";
    userFallback.textContent = "U";

    userBtn.addEventListener("click", () => {
      window.location.href = LOGIN_URL;
    });

    return;
  }

  // Si hay sesión: carga avatar y habilita dropdown
  await loadAvatar(session.user.id);

  userBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  // Cerrar al hacer click afuera
  document.addEventListener("click", () => closeDropdown());

  // Cerrar al presionar ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDropdown();
  });

  // Logout
  btnLogout.addEventListener("click", async () => {
    await supabase.auth.signOut();
    closeDropdown();
    window.location.href = LOGIN_URL;
  });
}

// Para que cambie el avatar “en vivo” cuando se actualiza sesión/token
supabase.auth.onAuthStateChange((_event, _session) => {
  // Recargar la página es lo más simple para reflejar estado
  // pero si prefieres, puedes re-ejecutar initUserMenu.
  // Aquí lo hacemos “suave”:
  initUserMenu();
});

initUserMenu();
