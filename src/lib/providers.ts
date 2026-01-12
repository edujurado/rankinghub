import { supabase } from './supabase'
import { Provider } from '@/types'

/**
 * Get providers by category
 * Fetches from canonical providers table (no API-specific fields)
 */
export async function getProvidersByCategory(category: string, searchQuery?: string): Promise<Provider[]> {
  // First get the category_id from the slug
  const { data: categoryData } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', category)
    .single() 

  if (!categoryData) {
    console.error('Category not found:', category)
    return []
  }

  let query = supabase
    .from('providers')
    .select(`
      *,
      skills (
        punctuality,
        professionalism,
        reliability,
        price,
        client_satisfaction
      ),
      categories (
        slug
      )
    `)
    .eq('category_id', categoryData.id)
    .eq('is_direct_provider', true) // Only show direct service providers
    .eq('is_active', true)
    .order('position', { ascending: true })

  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching providers:', error)
    return []
  }

  return data?.map(provider => mapProviderToDto(provider, category)) || []
}

/**
 * Get provider by ID
 */
export async function getProviderById(id: string): Promise<Provider | null> {
  const { data, error } = await supabase
    .from('providers')
    .select(`
      *,
      skills (
        punctuality,
        professionalism,
        reliability,
        price,
        client_satisfaction
      ),
      categories (
        slug
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching provider:', error)
    return null
  }

  if (!data) return null

  return mapProviderToDto(data, data.categories?.slug || 'djs')
}

/**
 * Get providers sorted by rating and social proof
 */
export async function getTopProviders(category?: string, limit: number = 10): Promise<Provider[]> {
  let query = supabase
    .from('providers')
    .select(`
      *,
      skills (
        punctuality,
        professionalism,
        reliability,
        price,
        client_satisfaction
      ),
      categories (
        slug
      )
    `)
    .eq('is_direct_provider', true) // Only show direct service providers
    .eq('is_active', true)
    .order('rating', { ascending: false })
    .order('social_proof_count', { ascending: false })
    .limit(limit)

  if (category) {
    // Get category_id from slug
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single()

    if (categoryData) {
      query = query.eq('category_id', categoryData.id)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching top providers:', error)
    return []
  }

  return data?.map(provider => mapProviderToDto(provider, provider.categories?.slug || 'djs')) || []
}

/**
 * Submit contact form
 */
export async function submitContactForm(providerId: string, formData: {
  name: string
  email: string
  phone?: string
  eventDate?: string
  eventType?: string
  message: string
}): Promise<boolean> {
  const { error } = await supabase
    .from('contact_submissions')
    .insert({
      provider_id: providerId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      event_date: formData.eventDate,
      event_type: formData.eventType,
      message: formData.message
    })

  if (error) {
    console.error('Error submitting contact form:', error)
    return false
  }

  return true
}

/**
 * Subscribe to newsletter
 */
export async function subscribeToNewsletter(email: string): Promise<boolean> {
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({
      email: email,
      status: 'active'
    })

  if (error) {
    console.error('Error subscribing to newsletter:', error)
    return false
  }

  return true
}

/**
 * Get provider with source data (for admin/detailed view)
 * Joins provider with its linked sources from provider_sources
 */
export async function getProviderWithSources(providerId: string): Promise<{
  provider: Provider | null
  sources: Array<{
    source: 'yelp' | 'google'
    rating: number | null
    review_count: number
    url: string | null
    price_range: string | null
  }>
}> {
  // Get provider
  const provider = await getProviderById(providerId)
  
  if (!provider) {
    return { provider: null, sources: [] }
  }

  // Get linked sources
  const { data: sources } = await supabase
    .from('provider_sources')
    .select('source, rating, review_count, yelp_url, website, price_range')
    .eq('provider_id', providerId)

  return {
    provider,
    sources: (sources || []).map(s => ({
      source: s.source as 'yelp' | 'google',
      rating: s.rating,
      review_count: s.review_count,
      url: s.source === 'yelp' ? s.yelp_url : s.website,
      price_range: s.price_range
    }))
    }
  }

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Map database provider record to DTO
 */
function mapProviderToDto(provider: Record<string, unknown>, category: string): Provider {
  const skills = provider.skills as Array<{
    punctuality: number
    professionalism: number
    reliability: number
    price: number
    client_satisfaction: number
  }> | undefined

  return {
    id: provider.id as string,
    name: provider.name as string,
    category: category as 'djs' | 'photographers' | 'videographers',
    position: provider.position as number,
    rating: provider.rating as number,
    verified: provider.verified as boolean,
    country: provider.country as string,
    location: provider.location as string,
    image: provider.image_url as string,
    skills: {
      punctuality: skills?.[0]?.punctuality || 0,
      professionalism: skills?.[0]?.professionalism || 0,
      reliability: skills?.[0]?.reliability || 0,
      price: skills?.[0]?.price || 0,
      clientSatisfaction: skills?.[0]?.client_satisfaction || 0
    },
    bio: provider.bio as string,
    portfolio: (provider.portfolio_images as string[]) || [],
    contact: {
      email: provider.email as string,
      phone: provider.phone as string,
      website: provider.website as string | undefined,
      instagram: provider.instagram as string | undefined
    }
  }
}
