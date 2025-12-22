import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://isdonrkccxlqmbrcgcwd.supabase.co";
const SUPABASE_KEY = "sb_publishable_4PMAd00y7QewY8PgL0rRNQ_jBCKls00";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
