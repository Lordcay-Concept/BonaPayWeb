import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase client for browser-side operations
 * This client is used in React components and hooks
 * It handles authentication and database operations on the client side
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Singleton instance for browser Supabase client
 * Use this in your components to avoid creating multiple instances
 */
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient()
  }
  return supabaseInstance
}