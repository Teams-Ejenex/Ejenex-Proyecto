import { supabase } from "../../core/supabaseClient.js";

export async function reportThread({ threadId, reason }) {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;
  if (!user) throw new Error("Inicia sesión para reportar.");

  const { data, error } = await supabase
    .from("forum_reports")
    .insert([{ user_id: user.id, thread_id: threadId, reason }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
