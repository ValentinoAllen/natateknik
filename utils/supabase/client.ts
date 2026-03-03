import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn("Missing Supabase credentials in .env.local");
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl || "", supabaseKey || "");
