import { supabase } from "../../core/supabaseClient.js";
import { getThreadById } from "./threads.api.js";
import { getCommentsByThread, addComment } from "./comments.api.js";
import { hasMyVote, upvote, removeVote } from "./votes.api.js";
import { reportThread } from "./reports.api.js";

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

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const params = new URLSearchParams(window.location.search);
const threadId = params.get("thread_id");

const elTitle = document.getElementById("title");
const elMeta = document.getElementById("meta");
const elBody = document.getElementById("body");

const btnVote = document.getElementById("btnVote");
const elVotes = document.getElementById("votes");

const loading = document.getElementById("loading");
const empty = document.getElementById("empty");
const commentsWrap = document.getElementById("comments");

const commentText = document.getElementById("commentText");
const btnSend = document.getElementById("btnSend");

const btnReport = document.getElementById("btnReport");
const modalBackdrop = document.getElementById("modalBackdrop");
const reportReason = document.getElementById("reportReason");
const btnCancel = document.getElementById("btnCancel");
const btnSubmitReport = document.getElementById("btnSubmitReport");

let currentThread = null;
let iVoted = false;

function openReport(){ modalBackdrop.style.display="flex"; }
function closeReport(){ modalBackdrop.style.display="none"; }

async function renderThread() {
  if (!threadId) {
    toast("Falta thread_id en la URL", "error");
    return;
  }

  currentThread = await getThreadById(threadId);

  elTitle.textContent = currentThread.title || "Hilo";
  elBody.textContent = currentThread.body || "";

  elMeta.textContent = `👍 ${currentThread.votes_count ?? 0} · ${new Date(currentThread.created_at).toLocaleString()}`;
  elVotes.textContent = String(currentThread.votes_count ?? 0);
}

function renderComments(list) {
  if (!list.length) {
    commentsWrap.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  commentsWrap.innerHTML = list.map(c => {
    const content = c.status === "deleted"
      ? "Comentario eliminado por moderación."
      : escapeHtml(c.content || "");

    return `
      <div class="comment">
        <div class="cmeta">${new Date(c.created_at).toLocaleString()}</div>
        <div class="ctext">${content}</div>
      </div>
    `;
  }).join("");
}

async function loadComments() {
  loading.style.display = "block";
  empty.style.display = "none";
  commentsWrap.innerHTML = "";

  try {
    const list = await getCommentsByThread(threadId);
    renderComments(list);
  } catch (e) {
    console.error(e);
    toast("No se pudieron cargar los comentarios.", "error");
    renderComments([]);
  } finally {
    loading.style.display = "none";
  }
}

async function refreshVoteState() {
  iVoted = await hasMyVote(threadId);
  // feedback visual simple
  btnVote.style.opacity = iVoted ? "1" : "0.85";
  btnVote.style.border = iVoted ? "1px solid rgba(34,211,238,.45)" : "";
}

btnVote.addEventListener("click", async () => {
  try {
    if (!iVoted) {
      await upvote(threadId);
      toast("Voto agregado ✅", "success");
    } else {
      await removeVote(threadId);
      toast("Voto removido ✅", "info");
    }

    // recargar thread para traer votes_count actualizado (por trigger)
    await renderThread();
    await refreshVoteState();
  } catch (e) {
    console.error(e);
    toast(e.message || "No se pudo votar.", "error");
  }
});

btnSend.addEventListener("click", async () => {
  const content = (commentText.value || "").trim();
  if (!content) {
    toast("Escribe un comentario.", "error");
    return;
  }

  try {
    btnSend.disabled = true;
    btnSend.textContent = "Enviando...";

    await addComment({ threadId, content });

    commentText.value = "";
    toast("Comentario publicado ✅", "success");
    await loadComments();
  } catch (e) {
    console.error(e);
    toast(e.message || "No se pudo comentar.", "error");
  } finally {
    btnSend.disabled = false;
    btnSend.textContent = "Comentar";
  }
});

// Reporte
btnReport.addEventListener("click", () => {
  reportReason.value = "";
  openReport();
});

btnCancel.addEventListener("click", closeReport);
modalBackdrop.addEventListener("click", (e) => { if (e.target === modalBackdrop) closeReport(); });

btnSubmitReport.addEventListener("click", async () => {
  const reason = (reportReason.value || "").trim();
  if (!reason) {
    toast("Escribe el motivo del reporte.", "error");
    return;
  }

  try {
    btnSubmitReport.disabled = true;
    btnSubmitReport.textContent = "Enviando...";

    await reportThread({ threadId, reason });
    toast("Reporte enviado ✅", "success");
    closeReport();
  } catch (e) {
    console.error(e);
    toast(e.message || "No se pudo reportar.", "error");
  } finally {
    btnSubmitReport.disabled = false;
    btnSubmitReport.textContent = "Enviar";
  }
});

await renderThread();
await refreshVoteState();
await loadComments();

// opcional: si cambia auth, actualiza el estado del voto
supabase.auth.onAuthStateChange(() => {
  refreshVoteState();
});
