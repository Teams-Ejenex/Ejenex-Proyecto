import { supabase } from "../../core/supabaseClient.js";

export async function getForumById(forumId) {
  const { data, error } = await supabase
    .from("forums")
    .select("id, name, description")
    .eq("id", forumId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getThreadsByForum(forumId) {
  const { data, error } = await supabase
    .from("forum_threads")
    .select("id, forum_id, user_id, title, body, votes_count, status, created_at, updated_at")
    .eq("forum_id", forumId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createThread({ forumId, title, body }) {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;
  if (!user) throw new Error("Inicia sesión para crear hilos.");

  const { data, error } = await supabase
    .from("forum_threads")
    .insert([{
      forum_id: forumId,
      user_id: user.id,
      title,
      body
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getThreadById(threadId) {
  const { data, error } = await supabase
    .from("forum_threads")
    .select("id, forum_id, user_id, title, body, votes_count, status, created_at, updated_at")
    .eq("id", threadId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}
