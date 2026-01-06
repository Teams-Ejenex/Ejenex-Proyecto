// src/js/core/auth.js
import { supabase } from "./supabaseClient.js";

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data; // { session, user }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session; // null si no hay sesión
}

export async function getMyRole() {
  const session = await getSession();
  if (!session) return null;

  const userId = session.user.id;

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data.role; // "admin" | "user"
}

export async function isAdmin() {
  const role = await getMyRole();
  return role === "admin";
}
