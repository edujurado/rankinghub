import { createClient } from '@supabase/supabase-js'

// Check if service role key is available
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

if (!serviceRoleKey) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY not found. User creation will use regular client.')
}

// Admin client with service role key for user creation (only if key is available)
const supabaseAdmin = serviceRoleKey && supabaseUrl ? createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
) : null

export async function createUserProfile(userData: {
  id: string
  email: string
  name: string
  role: string
  phone?: string
}) {
  // If admin client is not available, return false
  if (!supabaseAdmin) {
    console.error('Admin client not available. SUPABASE_SERVICE_ROLE_KEY is required.')
    return false
  }

  const { error } = await supabaseAdmin
    .from('users')
    .insert({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      phone: userData.phone,
      is_active: true
    })

  if (error) {
    console.error('Error creating user profile:', error)
    return false
  }

  return true
}
