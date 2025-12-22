import { supabase } from "./core/supabaseClient.js";

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
