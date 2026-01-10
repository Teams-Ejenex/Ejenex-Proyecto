// src/js/modules/ui/navbar.js

export function mountNavbar({
  active = "home",
  links = { home: "./index.html", groups: "./index.html?view=groups", forums: "./forums.html" },
  loginUrl = "./login.html",
} = {}) {
  const mount = document.getElementById("navbarMount");
  if (!mount) return;

  mount.innerHTML = `
    <nav class="navbar">
      <div class="logo">EJENEX</div>

      <div class="menu">
        <a href="${links.home}" class="${active === "home" ? "active" : ""}">Inicio</a>
        <a href="${links.groups}" class="${active === "groups" ? "active" : ""}">Grupos estudiantiles</a>
        <a href="${links.forums}" class="${active === "forums" ? "active" : ""}">Foros</a>
        <a href="#" aria-disabled="true">Material</a>
        <a href="#" aria-disabled="true">Sobre nosotros</a>
        <a href="#" aria-disabled="true">FeTecmi</a>
      </div>

      <div class="user-menu">
        <button class="user-btn" id="userBtn" aria-label="Usuario" type="button" title="Usuario">
          <span class="user-fallback" id="userFallback">U</span>
          <img class="user-avatar" id="userAvatar" alt="Foto de perfil" />
        </button>

        <div class="user-dropdown" id="userDropdown">
          <a href="../profile.html">Ver perfil</a>
          <a href="../profile-edit.html">Editar perfil</a>
          <a href="../admin/groups-create.html" id="btnCreateGroup" hidden>Crear grupo</a>
          <div class="divider"></div>
          <button type="button" id="btnLogout">Cerrar sesión</button>
        </div>
      </div>
    </nav>
  `;

  const userBtn = document.getElementById("userBtn");
  const userFallback = document.getElementById("userFallback");
  const userAvatar = document.getElementById("userAvatar");
  const dropdown = document.getElementById("userDropdown");
  const btnLogout = document.getElementById("btnLogout");
  const btnCreateGroup = document.getElementById("btnCreateGroup");

  const closeDropdown = () => dropdown.classList.remove("open");
  const toggleDropdown = () => dropdown.classList.toggle("open");

  function setAvatar(url, name) {
    if (url) {
      userAvatar.src = url;
      userAvatar.style.display = "block";
      userFallback.style.display = "none";
    } else {
      userAvatar.style.display = "none";
      userFallback.style.display = "inline";
      userFallback.textContent = name ? name[0].toUpperCase() : "U";
    }
  }

  // ✅ Siempre: si no hay sesión o si falla supabase, al menos manda a login
  function enableLoginFallback() {
    closeDropdown();
    setAvatar(null, "U");
    if (btnCreateGroup) btnCreateGroup.hidden = true;
    userBtn.onclick = () => (window.location.href = loginUrl);
  }

  // 1) Primero: fallback inmediato para que el botón NUNCA quede muerto
  enableLoginFallback();

  // 2) Luego intentamos cargar supabase (si falla, no rompe la UI)
  (async () => {
    let supabase;
    try {
      const mod = await import("../../core/supabaseClient.js");
      supabase = mod.supabase;
      if (!supabase) throw new Error("supabase no exportado (named export) desde supabaseClient.js");
    } catch (err) {
      console.error("NAVBAR: No se pudo importar supabaseClient.js", err);
      // Dejamos el fallback de login y salimos
      return;
    }

    async function initUser() {
      closeDropdown();

      const { data } = await supabase.auth.getSession();
      const session = data?.session;

      // SIN SESIÓN => login
      if (!session?.user) {
        enableLoginFallback();
        return;
      }

      // CON SESIÓN => dropdown
      userBtn.onclick = (e) => {
        e.stopPropagation();
        toggleDropdown();
      };

      // listeners globales (una vez)
      document.addEventListener("click", closeDropdown);
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDropdown(); });

      // Cargar avatar + role
      try {
        const { data: p, error } = await supabase
          .from("profiles")
          .select("full_name, profile_picture_url, role")
          .eq("id", session.user.id)
          .single();

        if (error) throw error;

        const name = (p?.full_name || "U").trim() || "U";
        setAvatar(p?.profile_picture_url || null, name);

        if (btnCreateGroup) btnCreateGroup.hidden = (p?.role !== "admin");
      } catch (e) {
        console.warn("NAVBAR: No se pudo cargar perfil:", e.message);
        setAvatar(null, "U");
        if (btnCreateGroup) btnCreateGroup.hidden = true;
      }

      // ✅ Logout con reload
      btnLogout.onclick = async () => {
        try {
          await supabase.auth.signOut();
        } finally {
          closeDropdown();
          window.location.reload();
        }
      };
    }

    await initUser();
    supabase.auth.onAuthStateChange(() => initUser());
  })();
}
