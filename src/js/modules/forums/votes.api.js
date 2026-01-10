import { supabase } from "../../core/supabaseClient.js";

export async function hasMyVote(threadId) {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;
  if (!user) return false;

  const { data, error } = await supabase
    .from("forum_votes")
    .select("id")
    .eq("thread_id", threadId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return !!data;
}

export async function upvote(threadId) {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;
  if (!user) throw new Error("Inicia sesión para votar.");

  const { error } = await supabase
    .from("forum_votes")
    .insert([{ thread_id: threadId, user_id: user.id }]);

  // Si ya votó, unique constraint falla
  if (error && !String(error.message).toLowerCase().includes("duplicate")) {
    throw new Error(error.message);
  }
}

export async function removeVote(threadId) {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;
  if (!user) throw new Error("Inicia sesión para quitar voto.");

  const { error } = await supabase
    .from("forum_votes")
    .delete()
    .eq("thread_id", threadId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
}
