import { getForumById, getThreadsByForum, createThread } from "./threads.api.js";

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
const forumId = params.get("forum_id");

const forumTitle = document.getElementById("forumTitle");
const forumDesc = document.getElementById("forumDesc");

const grid = document.getElementById("grid");
const empty = document.getElementById("empty");
const loading = document.getElementById("loading");
const search = document.getElementById("search");

const btnNewThread = document.getElementById("btnNewThread");
const modalBackdrop = document.getElementById("modalBackdrop");
const threadTitle = document.getElementById("threadTitle");
const threadBody = document.getElementById("threadBody");
const btnCancel = document.getElementById("btnCancel");
const btnCreate = document.getElementById("btnCreate");

let all = [];

function openModal(){ modalBackdrop.style.display="flex"; }
function closeModal(){ modalBackdrop.style.display="none"; }

function render(list){
  if(!list.length){
    grid.innerHTML="";
    empty.style.display="block";
    return;
  }
  empty.style.display="none";

  grid.innerHTML = list.map(t => `
    <article class="card" data-id="${t.id}">
      <div class="title">${escapeHtml(t.title)}</div>
      <div class="meta">👍 ${t.votes_count ?? 0} · ${new Date(t.created_at).toLocaleString()}</div>
      <div class="body">${escapeHtml((t.body || "").slice(0, 160))}${(t.body || "").length > 160 ? "..." : ""}</div>
      <div class="actions">
        <div class="pill">Abrir hilo →</div>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll(".card").forEach(card=>{
    card.addEventListener("click", ()=>{
      const id = card.getAttribute("data-id");
      window.location.href = `./thread.html?thread_id=${encodeURIComponent(id)}`;
    });
  });
}

function applyFilter(){
  const q = (search.value||"").trim().toLowerCase();
  const filtered = all.filter(t =>
    !q ||
    (t.title||"").toLowerCase().includes(q) ||
    (t.body||"").toLowerCase().includes(q)
  );
  render(filtered);
}

async function load(){
  if(!forumId){
    toast("Falta forum_id en la URL", "error");
    return;
  }

  loading.style.display="block";
  empty.style.display="none";
  grid.innerHTML="";

  try{
    const forum = await getForumById(forumId);
    forumTitle.textContent = forum?.name || "Foro";
    forumDesc.textContent = forum?.description || "";

    all = await getThreadsByForum(forumId);
    applyFilter();
  } catch(e){
    console.error(e);
    toast(e.message || "No se pudo cargar el foro/hilos.", "error");
    all = [];
    render([]);
  } finally {
    loading.style.display="none";
  }
}

btnNewThread.addEventListener("click", ()=>{
  threadTitle.value="";
  threadBody.value="";
  openModal();
});
btnCancel.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click",(e)=>{ if(e.target===modalBackdrop) closeModal(); });

btnCreate.addEventListener("click", async ()=>{
  const title = (threadTitle.value||"").trim();
  const body = (threadBody.value||"").trim();

  if(!title || !body){
    toast("Completa título y contenido.", "error");
    return;
  }

  try{
    await createThread({ forumId, title, body });
    toast("Hilo publicado ✅", "success");
    closeModal();
    await load();
  }catch(e){
    console.error(e);
    toast(e.message || "No se pudo publicar el hilo.", "error");
  }
});

search.addEventListener("input", applyFilter);

await load();
