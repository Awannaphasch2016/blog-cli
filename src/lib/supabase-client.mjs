// Supabase client for Meta-DSL registry
import { createClient } from '@supabase/supabase-js';

let supabaseClient = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }

  return supabaseClient;
}

// Test connection utility
export async function testSupabaseConnection() {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.from('meta_dsl_registry').select('count', { count: 'exact', head: true });

    if (error) {
      throw new Error(`Supabase connection failed: ${error.message}`);
    }

    return { success: true, message: 'Supabase connection successful' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}