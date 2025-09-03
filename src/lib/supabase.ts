import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Read env vars but avoid throwing during module evaluation. Some environments
// (build, tests, or serverless edge runtimes) may not provide env vars at import time.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Supabase client may not work until these are provided.')
}

// Export a client even if keys are empty to avoid module-eval crashes. Calls made
// with invalid credentials will fail at runtime with clearer Supabase errors.
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
