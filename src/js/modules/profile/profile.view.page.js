// src/js/modules/profile/profile.view.page.js
import { supabase } from "../../core/supabaseClient.js";

function toast(msg, type = "info") {
  const colors = {
    success: "linear-gradient(90deg, #22c55e, #16a34a)",
    error: "linear-gradient(90deg, #ef4444, #b91c1c)",
    info: "linear-gradient(90deg, #a855f7, #7c3aed)",
  };

  Toastify({
    text: msg,
    duration: 3200,
    close: true,
    gravity: "top",
    position: "right",
    stopOnFocus: true,
    style: { background: colors[type] ?? colors.info },
  }).showToast();
}

function setAvatar({ url, name }) {
  const img = document.getElementById("avatarImg");
  const fallback = document.getElementById("avatarFallback");

  const letter = (name?.trim()?.[0] || "U").toUpperCase();

  if (url) {
    img.src = url;
    img.style.display = "block";
    fallback.style.display = "none";
  } else {
    img.style.display = "none";
    fallback.style.display = "block";
    fallback.textContent = letter;
  }
}

function renderTags(containerId, items, emptyText = "Sin datos") {
  const el = document.getElementById(containerId);

  if (!items || items.length === 0) {
    el.className = "muted";
    el.textContent = emptyText;
    return;
  }

  const wrap = document.createElement("div");
  wrap.className = "list";
  items.forEach((t) => {
    const pill = document.createElement("span");
    pill.className = "pill";
    pill.textContent = String(t);
    wrap.appendChild(pill);
  });

  el.className = "";
  el.innerHTML = "";
  el.appendChild(wrap);
}

async function getMyProfile() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("No hay sesión activa");

  const user = session.user;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, career, interests, favorite_groups, profile_picture_url, role")
    .eq("id", user.id)
    .single();

  if (error) throw new Error(error.message);

  return { user, profile };
}

(async () => {
  try {
    const { user, profile } = await getMyProfile();

    document.getElementById("subtitle").textContent = "Tu información pública dentro de EJENEX";
    document.getElementById("email").textContent = user.email ?? "—";
    document.getElementById("userId").textContent = profile.id;

    const fullName = profile.full_name?.trim() || "Usuario";
    document.getElementById("fullName").textContent = fullName;

    document.getElementById("career").textContent = profile.career?.trim() || "Sin carrera seleccionada";

    setAvatar({ url: profile.profile_picture_url, name: fullName });

    if (profile.role) {
      document.getElementById("roleRow").style.display = "flex";
      document.getElementById("roleChip").textContent = `Rol: ${profile.role}`;
    }

    renderTags("interests", Array.isArray(profile.interests) ? profile.interests : [], "Sin intereses todavía");
    renderTags("favoriteGroups", Array.isArray(profile.favorite_groups) ? profile.favorite_groups : [], "Sin grupos favoritos todavía");
  } catch (err) {
    console.error(err);
    toast(err.message || "No se pudo cargar el perfil", "error");

    // si no hay sesión, mándalo a login
    if ((err?.message || "").toLowerCase().includes("sesión")) {
      window.location.href = "./public/login.html";
    }
  }
})();
