// src/js/modules/auth/auth.register.page.js
import { supabase } from "../../core/supabaseClient.js";

function toast(msg, type = "info") {
  const colors = {
    success: "linear-gradient(90deg, #22c55e, #16a34a)",
    error: "linear-gradient(90deg, #ef4444, #b91c1c)",
    info: "linear-gradient(90deg, #a855f7, #7c3aed)",
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

function setLoading(isLoading) {
  const btn = document.getElementById("btn-register");
  if (!btn) return;
  btn.disabled = isLoading;
  btn.textContent = isLoading ? "Creando..." : "Crear cuenta";
}

document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    toast("Completa correo y contraseña.", "error");
    return;
  }

  try {
    setLoading(true);

    // 1) Crear usuario en Supabase Auth
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    // Si "Email confirmation" está activado, user existe, pero NO hay sesión activa.
    // El trigger se ejecuta en el backend y crea el profile.
    toast(
      "Cuenta creada. Si te pide confirmación, revisa tu correo.",
      "success"
    );

    e.target.reset();

    // Opcional: mandar a login
    // window.location.href = "./login.html";
  } catch (err) {
    console.error(err);
    toast(err?.message || "No se pudo crear la cuenta.", "error");
  } finally {
    setLoading(false);
  }
});
