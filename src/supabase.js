import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if real values are configured (not placeholders)
export const supabaseConfigured = !!(
  rawUrl &&
  rawKey &&
  rawUrl.startsWith('https://') &&
  !rawUrl.includes('your_supabase')
)

// Only create client if we have valid credentials
export const supabase = supabaseConfigured
  ? createClient(rawUrl, rawKey)
  : null
