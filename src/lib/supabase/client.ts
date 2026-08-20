// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Log to verify env variables are loaded (remove in production)
  console.log("🔑 Supabase URL:", supabaseUrl ? "✅ Loaded" : "❌ Missing")
  console.log("🔑 Supabase Anon Key:", supabaseAnonKey ? "✅ Loaded" : "❌ Missing")
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}