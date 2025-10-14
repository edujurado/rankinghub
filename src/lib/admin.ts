import { supabase } from './supabase'
import { Provider } from '@/types'

// Admin Dashboard Stats
export interface DashboardStats {
  totalProviders: number
  totalContacts: number
  totalViews: number
  totalReviews: number
  recentContacts: ContactSubmission[]
  topProviders: Provider[]
  analyticsData: any[]
}

export interface ContactSubmission {
  id: string
  provider_id?: string
  name: string
  email: string
  phone?: string
  event_date?: string
  event_type?: string
  message: string
  status: string
  created_at: string
  provider_name?: string
}

export interface AdminProfile {
  id: string
  email: string
  name?: string
  phone?: string
  role?: string
}

// Get dashboard statistics
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get total providers
    const { count: totalProviders } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })

    // Get total contact submissions
    const { count: totalContacts } = await supabase
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true })

    // Get total views (sum of view_count from providers)
    const { data: providersData } = await supabase
      .from('providers')
      .select('view_count')
    
    const totalViews = providersData?.reduce((sum, provider) => sum + (provider.view_count || 0), 0) || 0

    // Get total reviews
    const { count: totalReviews } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })

    // Get recent contacts
    const { data: recentContacts } = await supabase
      .from('contact_submissions')
      .select(`
        *,
        providers (
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get top providers by views
    const { data: topProviders } = await supabase
      .from('providers')
      .select('*')
      .order('view_count', { ascending: false })
      .limit(5)

    return {
      totalProviders: totalProviders || 0,
      totalContacts: totalContacts || 0,
      totalViews,
      totalReviews: totalReviews || 0,
      recentContacts: recentContacts?.map(contact => ({
        ...contact,
        provider_name: contact.providers?.name
      })) || [],
      topProviders: topProviders || [],
      analyticsData: []
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      totalProviders: 0,
      totalContacts: 0,
      totalViews: 0,
      totalReviews: 0,
      recentContacts: [],
      topProviders: [],
      analyticsData: []
    }
  }
}

// Provider Management
export async function getAllProviders(): Promise<Provider[]> {
  const { data, error } = await supabase
    .from('providers')
    .select(`
      *,
      categories:categories ( name, slug ),
      skills (
        punctuality,
        professionalism,
        reliability,
        price,
        client_satisfaction
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching providers:', error)
    return []
  }

  return data?.map((provider: any) => ({
    id: provider.id,
    name: provider.name,
    category: (provider.categories?.slug || provider.category || 'djs') as 'djs' | 'photographers' | 'videographers',
    position: provider.position,
    rating: provider.rating,
    verified: provider.verified,
    country: provider.country,
    location: provider.location,
    image: provider.image_url,
    skills: {
      punctuality: provider.skills?.[0]?.punctuality || 0,
      professionalism: provider.skills?.[0]?.professionalism || 0,
      reliability: provider.skills?.[0]?.reliability || 0,
      price: provider.skills?.[0]?.price || 0,
      clientSatisfaction: provider.skills?.[0]?.client_satisfaction || 0
    },
    bio: provider.bio,
    portfolio: [],
    contact: {
      email: provider.email,
      phone: provider.phone,
      website: provider.website,
      instagram: provider.instagram
    }
  })) || []
}

export async function createProvider(providerData: {
  name: string
  category?: 'djs' | 'photographers' | 'videographers'
  category_id?: string
  position: number
  rating: number
  verified: boolean
  country: string
  location: string
  image_url: string
  bio: string
  email: string
  phone: string
  website?: string
  instagram?: string
  skills: {
    punctuality: number
    professionalism: number
    reliability: number
    price: number
    client_satisfaction: number
  }
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Resolve category_id if only slug provided
    let categoryId = providerData.category_id
    if (!categoryId && providerData.category) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id, slug')
        .eq('slug', providerData.category)
        .single()
      categoryId = cat?.id
    }

    if (!categoryId) {
      return { success: false, error: 'Category is required' }
    }

    // Create provider
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .insert({
        name: providerData.name,
        category_id: categoryId,
        position: providerData.position,
        rating: providerData.rating,
        verified: providerData.verified,
        country: providerData.country,
        location: providerData.location,
        image_url: providerData.image_url,
        bio: providerData.bio,
        email: providerData.email,
        phone: providerData.phone,
        website: providerData.website,
        instagram: providerData.instagram
      })
      .select()
      .single()

    if (providerError) {
      return { success: false, error: providerError.message }
    }

    // Create skills record
    const { error: skillsError } = await supabase
      .from('skills')
      .insert({
        provider_id: provider.id,
        punctuality: providerData.skills.punctuality,
        professionalism: providerData.skills.professionalism,
        reliability: providerData.skills.reliability,
        price: providerData.skills.price,
        client_satisfaction: providerData.skills.client_satisfaction
      })

    if (skillsError) {
      console.error('Error creating skills:', skillsError)
      // Don't fail the whole operation for skills error
    }

    return { success: true, id: provider.id }
  } catch (error) {
    console.error('Error creating provider:', error)
    return { success: false, error: 'Failed to create provider' }
  }
}

export async function updateProvider(id: string, providerData: Partial<{
  name: string
  category?: 'djs' | 'photographers' | 'videographers'
  category_id?: string
  position: number
  rating: number
  verified: boolean
  country: string
  location: string
  image_url: string
  bio: string
  email: string
  phone: string
  website: string
  instagram: string
  skills: {
    punctuality: number
    professionalism: number
    reliability: number
    price: number
    client_satisfaction: number
  }
}>): Promise<{ success: boolean; error?: string }> {
  try {
    // Resolve category_id if only slug provided
    let categoryId = providerData.category_id
    if (!categoryId && providerData.category) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id, slug')
        .eq('slug', providerData.category)
        .single()
      categoryId = cat?.id
    }

    // Update provider
    const { error: providerError } = await supabase
      .from('providers')
      .update({
        name: providerData.name,
        category_id: categoryId,
        position: providerData.position,
        rating: providerData.rating,
        verified: providerData.verified,
        country: providerData.country,
        location: providerData.location,
        image_url: providerData.image_url,
        bio: providerData.bio,
        email: providerData.email,
        phone: providerData.phone,
        website: providerData.website,
        instagram: providerData.instagram
      })
      .eq('id', id)

    if (providerError) {
      return { success: false, error: providerError.message }
    }

    // Update skills if provided
    if (providerData.skills) {
      const { error: skillsError } = await supabase
        .from('skills')
        .update({
          punctuality: providerData.skills.punctuality,
          professionalism: providerData.skills.professionalism,
          reliability: providerData.skills.reliability,
          price: providerData.skills.price,
          client_satisfaction: providerData.skills.client_satisfaction
        })
        .eq('provider_id', id)

      if (skillsError) {
        console.error('Error updating skills:', skillsError)
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating provider:', error)
    return { success: false, error: 'Failed to update provider' }
  }
}

export async function deleteProvider(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete skills first (foreign key constraint)
    await supabase
      .from('skills')
      .delete()
      .eq('provider_id', id)

    // Delete provider
    const { error } = await supabase
      .from('providers')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting provider:', error)
    return { success: false, error: 'Failed to delete provider' }
  }
}

// Admin profile
export async function getAdminProfile(): Promise<AdminProfile | null> {
  const { data: userRes } = await supabase.auth.getUser()
  const user = userRes.user
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('id,email,name,phone,role')
    .eq('id', user.id)
    .single()

  return data || { id: user.id, email: user.email || '' }
}

export async function updateAdminProfile(update: Partial<AdminProfile>): Promise<{ success: boolean; error?: string }> {
  const { data: userRes } = await supabase.auth.getUser()
  const user = userRes.user
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('users')
    .update({
      name: update.name,
      phone: update.phone
    })
    .eq('id', user.id)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

// CSV Import
export async function importProvidersFromCSV(csvData: string): Promise<{
  success: boolean
  imported: number
  errors: string[]
}> {
  const errors: string[] = []
  let imported = 0

  try {
    const lines = csvData.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      
      if (values.length < headers.length) continue

      const rowData: any = {}
      headers.forEach((header, index) => {
        rowData[header] = values[index]
      })

      // Map CSV columns to our database schema
      const clamp = (val: number, min: number = 1, max: number = 5) => {
        if (isNaN(val)) return 3
        return Math.max(min, Math.min(max, Math.round(val)))
      }

      const providerData = {
        name: rowData.name || rowData.provider_name,
        category: (rowData.category || 'djs').toLowerCase(),
        position: parseInt(rowData.position) || 1,
        rating: parseFloat(rowData.rating) || 0,
        verified: rowData.verified === 'true' || rowData.verified === '1',
        country: rowData.country || 'USA',
        location: rowData.location || rowData.city,
        image_url: rowData.image_url || rowData.image || 'https://via.placeholder.com/150',
        bio: rowData.bio || rowData.description || '',
        email: rowData.email,
        phone: rowData.phone,
        website: rowData.website,
        instagram: rowData.instagram,
        skills: {
          punctuality: clamp(parseFloat(rowData.punctuality)),
          professionalism: clamp(parseFloat(rowData.professionalism)),
          reliability: clamp(parseFloat(rowData.reliability)),
          price: clamp(parseFloat(rowData.price)),
          client_satisfaction: clamp(parseFloat(rowData.client_satisfaction))
        }
      }

      const result = await createProvider(providerData)
      if (result.success) {
        imported++
      } else {
        errors.push(`Row ${i + 1}: ${result.error}`)
      }
    }

    return { success: true, imported, errors }
  } catch (error) {
    console.error('Error importing CSV:', error)
    return { success: false, imported, errors: ['Failed to parse CSV file'] }
  }
}

// Contact Management
export async function getAllContacts(): Promise<ContactSubmission[]> {
  const { data, error } = await supabase
    .from('contact_submissions')
    .select(`
      *,
      providers (
        name
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching contacts:', error)
    return []
  }

  return data?.map(contact => ({
    ...contact,
    provider_name: contact.providers?.name
  })) || []
}

export async function updateContactStatus(id: string, status: string, adminNotes?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('contact_submissions')
      .update({
        status,
        admin_notes: adminNotes
      })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating contact status:', error)
    return { success: false, error: 'Failed to update contact status' }
  }
}

export async function deleteContact(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting contact:', error)
    return { success: false, error: 'Failed to delete contact' }
  }
}
