import { supabase } from './supabase'

export async function createUserProfile(userData: {
  id: string
  email: string
  name: string
  role: string
  phone?: string
}) {
  try {
    // Try to insert using the regular client
    // This will work if the RLS policy allows it
    const { error } = await supabase
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
  } catch (error) {
    console.error('Error creating user profile:', error)
    return false
  }
}
