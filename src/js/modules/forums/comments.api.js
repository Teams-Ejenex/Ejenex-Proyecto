import { supabase } from "../../core/supabaseClient.js";

export async function getCommentsByThread(threadId) {
  const { data, error } = await supabase
    .from("forum_comments")
    .select("id, thread_id, user_id, content, status, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function addComment({ threadId, content }) {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;
  if (!user) throw new Error("Inicia sesión para comentar.");

  const { data, error } = await supabase
    .from("forum_comments")
    .insert([{
      thread_id: threadId,
      user_id: user.id,
      content
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
