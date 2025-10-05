import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'
import { createUserProfile } from './auth-simple'

export interface AuthUser {
  id: string
  email: string
  role: 'provider' | 'admin'
  provider_id?: string
  is_verified: boolean
  created_at: string
}

export interface ProviderClaim {
  id: string
  provider_id: string
  claimant_email: string
  claimant_name: string
  claimant_phone?: string
  business_license?: string
  tax_id?: string
  verification_documents?: string[]
  status: 'pending' | 'approved' | 'rejected'
  admin_notes?: string
  verified_by?: string
  verified_at?: string
  created_at: string
}

// Authentication functions
export async function signUp(email: string, password: string, userData: {
  name: string
  phone?: string
  role: 'provider' | 'admin'
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: userData.name,
        phone: userData.phone,
        role: userData.role
      }
    }
  })

  if (error) {
    console.error('Sign up error:', error)
    return { success: false, error: error.message }
  }

  // Create user record in our users table
  if (data.user) {
    try {
      const success = await createUserProfile({
        id: data.user.id,
        email: email,
        name: userData.name,
        role: userData.role,
        phone: userData.phone
      })

      if (!success) {
        console.warn('User profile creation failed, but signup was successful. User can still sign in.')
      }
    } catch (error) {
      console.warn('User profile creation failed, but signup was successful. User can still sign in.', error)
    }
  }

  return { success: true, user: data.user }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    console.error('Sign in error:', error)
    return { success: false, error: error.message }
  }

  return { success: true, user: data.user }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Sign out error:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  // Get additional user data from our users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (userError && userError.code !== 'PGRST116') {
    console.error('Error fetching user data:', userError)
    return null
  }

  return {
    id: user.id,
    email: user.email || '',
    role: userData?.role || 'provider',
    provider_id: userData?.provider_id,
    is_verified: userData?.is_active || false,
    created_at: user.created_at
  }
}

// Provider claim functions
export async function submitProviderClaim(claimData: {
  provider_id: string
  claimant_email: string
  claimant_name: string
  claimant_phone?: string
  business_license?: string
  tax_id?: string
  verification_documents?: string[]
}) {
  const { data, error } = await supabase
    .from('provider_claims')
    .insert({
      ...claimData,
      status: 'pending'
    })
    .select()
    .single()

  if (error) {
    console.error('Error submitting provider claim:', error)
    return { success: false, error: error.message }
  }

  return { success: true, claim: data }
}

export async function getProviderClaims(): Promise<ProviderClaim[]> {
  const { data, error } = await supabase
    .from('provider_claims')
    .select(`
      *,
      providers (
        name,
        category_id,
        categories (
          name
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching provider claims:', error)
    return []
  }

  return data || []
}

export async function updateProviderClaimStatus(
  claimId: string, 
  status: 'approved' | 'rejected',
  adminNotes?: string
) {
  const { data, error } = await supabase
    .from('provider_claims')
    .update({
      status,
      admin_notes: adminNotes,
      verified_at: new Date().toISOString()
    })
    .eq('id', claimId)
    .select()
    .single()

  if (error) {
    console.error('Error updating provider claim:', error)
    return { success: false, error: error.message }
  }

  return { success: true, claim: data }
}

// Password reset
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  })

  if (error) {
    console.error('Password reset error:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Update password
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    console.error('Password update error:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
