import { supabase } from './supabase'
import { Provider } from '@/types'

export async function getProvidersByCategory(category: string, searchQuery?: string): Promise<Provider[]> {
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
      )
    `)
    .eq('category', category)
    .order('position', { ascending: true })

  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching providers:', error)
    return []
  }

  return data?.map(provider => ({
    id: provider.id,
    name: provider.name,
    category: provider.category as 'djs' | 'photographers' | 'videographers',
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
    portfolio: [], // TODO: Add portfolio images
    contact: {
      email: provider.email,
      phone: provider.phone,
      website: provider.website,
      instagram: provider.instagram
    }
  })) || []
}

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
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching provider:', error)
    return null
  }

  if (!data) return null

  return {
    id: data.id,
    name: data.name,
    category: data.category as 'djs' | 'photographers' | 'videographers',
    position: data.position,
    rating: data.rating,
    verified: data.verified,
    country: data.country,
    location: data.location,
    image: data.image_url,
    skills: {
      punctuality: data.skills?.[0]?.punctuality || 0,
      professionalism: data.skills?.[0]?.professionalism || 0,
      reliability: data.skills?.[0]?.reliability || 0,
      price: data.skills?.[0]?.price || 0,
      clientSatisfaction: data.skills?.[0]?.client_satisfaction || 0
    },
    bio: data.bio,
    portfolio: [], // TODO: Add portfolio images
    contact: {
      email: data.email,
      phone: data.phone,
      website: data.website,
      instagram: data.instagram
    }
  }
}

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

export async function subscribeToNewsletter(email: string): Promise<boolean> {
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({
      email: email,
      active: true
    })

  if (error) {
    console.error('Error subscribing to newsletter:', error)
    return false
  }

  return true
}
