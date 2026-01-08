// src/js/modules/auth/auth.login.page.js
import { signIn } from "../../core/auth.js";

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

function setLoading(isLoading) {
  const btn = document.getElementById("btn-login");
  if (!btn) return;
  btn.disabled = isLoading;
  btn.textContent = isLoading ? "Ingresando..." : "Iniciar sesión";
}

document.getElementById("forgot-link")?.addEventListener("click", (e) => {
  e.preventDefault();
  toast("Aún no implementado (Sprint futuro).", "info");
});

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    toast("Completa correo y contraseña.", "error");
    return;
  }

  try {
    setLoading(true);
    await signIn(email, password);
    toast("Sesión iniciada correctamente", "success");

    // Regresa al inicio
    window.location.href = "./index.html";
  } catch (err) {
    console.error(err);
    toast(err?.message || "No se pudo iniciar sesión", "error");
  } finally {
    setLoading(false);
  }
});
