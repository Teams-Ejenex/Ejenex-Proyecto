//API del módulo
import { supabase } from '../../core/supabaseClient.js';

export const getActiveNotices = async () => {
  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .eq('status', 'published')
    .lte('start_date', new Date().toISOString())
    .gte('end_date', new Date().toISOString())
    .order('start_date', { ascending: false });

  if (error) throw error;
  return data;
};

export const getAllNotices = async () => {
  const { data, error } = await supabase.from('notices').select('*');
  if (error) throw error;
  return data;
};

export const createNotice = async (notice) => {
  const { error } = await supabase.from('notices').insert(notice);
  if (error) throw error;
};

export const deleteNotice = async (id) => {
  const { error } = await supabase.from('notices').delete().eq('id', id);
  if (error) throw error;
};