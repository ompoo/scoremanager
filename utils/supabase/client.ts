import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'
import { getSupabasePublishableKey, getSupabaseUrl } from './env'

export function createClient() {
  return createBrowserClient<Database>(
    getSupabaseUrl(),
    getSupabasePublishableKey()
  )
}
