import { supabase } from "./core/supabaseClient.js";
import { signIn, getSession, getMyRole } from "./core/auth.js";

async function testConnection() {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .limit(5);

  if (error) {
    console.error("Error de conexión:", error.message);
  } else {
    console.log("Conexión exitosa. Datos:", data);
  }
}

testConnection();

// src/js/test-supabase.js
async function run() {
  try {
    await signIn("Al05054355@tecmilenio.mx", "nno1]4fiV:B$b2xU");
    const session = await getSession();
    console.log("Session:", session);

    const role = await getMyRole();
    console.log("Mi rol:", role);
  } catch (e) {
    console.error("Auth error:", e.message);
  }
}

run();
