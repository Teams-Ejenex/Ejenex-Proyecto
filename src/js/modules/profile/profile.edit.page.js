import { getMyProfile, updateMyProfile, uploadMyProfilePicture } from "./profile.api.js";

function toast(msg, type = "info") {
  const colors = {
    success: "linear-gradient(90deg, #22c55e, #16a34a)",
    error: "linear-gradient(90deg, #ef4444, #b91c1c)",
    info: "linear-gradient(90deg, #3b82f6, #2563eb)",
  };

  Toastify({
    text: msg,
    duration: 3000,
    close: true,
    gravity: "top",
    position: "right",
    stopOnFocus: true,
    style: { background: colors[type] ?? colors.info },
  }).showToast();
}

function setLoading(isLoading) {
  const btn = document.getElementById("btn-save");
  if (!btn) return;
  btn.disabled = isLoading;
  btn.textContent = isLoading ? "Guardando..." : "Guardar";
}

function parseCommaList(value) {
  return value
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

async function loadProfile() {
  const p = await getMyProfile();

  document.getElementById("full_name").value = p.full_name ?? "";
  document.getElementById("career").value = p.career ?? "";
  document.getElementById("interests").value = Array.isArray(p.interests) ? p.interests.join(", ") : "";
  document.getElementById("favorite_groups").value = Array.isArray(p.favorite_groups) ? p.favorite_groups.join(", ") : "";

  return p;
}

document.getElementById("profile-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const full_name = document.getElementById("full_name").value.trim() || null;
  const career = document.getElementById("career").value.trim() || null;

  const interestsRaw = document.getElementById("interests").value.trim();
  const favoriteRaw = document.getElementById("favorite_groups").value.trim();

  const interests = interestsRaw ? parseCommaList(interestsRaw) : [];
  const favorite_groups = favoriteRaw ? parseCommaList(favoriteRaw) : [];

  const file = document.getElementById("avatar").files?.[0] ?? null;

  try {
    setLoading(true);

    let profile_picture_url = null;
    if (file) {
      profile_picture_url = await uploadMyProfilePicture(file);
    }

    await updateMyProfile({
      full_name,
      career,
      interests,
      favorite_groups,
      ...(profile_picture_url ? { profile_picture_url } : {}),
    });

    toast("Perfil actualizado ✅", "success");
  } catch (err) {
    console.error(err);
    toast(`Error: ${err.message}`, "error");
  } finally {
    setLoading(false);
  }
});

(async () => {
  try {
    await loadProfile();
  } catch (err) {
    console.error(err);
    toast("No se pudo cargar el perfil (¿sesión activa?)", "error");
  }
})();
