import { supabase } from './supabase'

// Enhanced database service with full CRUD operations

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Provider {
  id: string
  name: string
  category_id: string
  category_name: string
  category_slug: string
  position: number
  rating: number
  verified: boolean
  featured: boolean
  country: string
  location: string
  city?: string
  state?: string
  zip_code?: string
  latitude?: number
  longitude?: number
  image_url?: string
  bio: string
  short_bio?: string
  email: string
  phone?: string
  website?: string
  instagram?: string
  facebook?: string
  twitter?: string
  youtube?: string
  tiktok?: string
  linkedin?: string
  price_range?: string
  availability_status: string
  years_experience?: number
  languages?: string[]
  service_areas?: string[]
  specialties?: string[]
  equipment_list?: string[]
  awards?: string[]
  certifications?: string[]
  portfolio_images?: string[]
  portfolio_videos?: string[]
  social_proof_count: number
  view_count: number
  contact_count: number
  is_active: boolean
  is_claimed: boolean
  is_direct_provider: boolean
  claimed_at?: string
  last_updated_at: string
  created_at: string
  updated_at: string
  // Skills
  punctuality?: number
  professionalism?: number
  reliability?: number
  price?: number
  client_satisfaction?: number
  communication?: number
  creativity?: number
  flexibility?: number
  overall_rating?: number
  // Reviews
  review_count?: number
  average_review_rating?: number
}

export interface Review {
  id: string
  provider_id: string
  client_name: string
  client_email: string
  rating: number
  title?: string
  comment?: string
  event_type?: string
  event_date?: string
  is_verified: boolean
  is_featured: boolean
  is_public: boolean
  admin_notes?: string
  created_at: string
  updated_at: string
}

export interface ContactSubmission {
  id: string
  provider_id?: string
  name: string
  email: string
  phone?: string
  company?: string
  event_date?: string
  event_type?: string
  event_location?: string
  guest_count?: number
  budget_range?: string
  message: string
  status: string
  admin_notes?: string
  provider_response?: string
  follow_up_date?: string
  created_at: string
  updated_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  featured_image?: string
  author_name?: string
  author_email?: string
  category?: string
  tags?: string[]
  meta_title?: string
  meta_description?: string
  is_published: boolean
  is_featured: boolean
  view_count: number
  published_at?: string
  created_at: string
  updated_at: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  first_name?: string
  last_name?: string
  interests?: string[]
  source?: string
  status: string
  subscribed_at: string
  unsubscribed_at?: string
  last_email_sent?: string
  email_count: number
}

// Categories
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data || []
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching category:', error)
    return null
  }

  return data
}

// Providers
export async function getProvidersByCategory(
  categorySlug: string, 
  searchQuery?: string,
  sortBy: 'rating' | 'price' | 'popularity' = 'rating',
  limit?: number
): Promise<Provider[]> {
  let query = supabase
    .from('providers')
    .select(`
      *,
      categories (
        name,
        slug
      ),
      skills (
        punctuality,
        professionalism,
        reliability,
        price,
        client_satisfaction
      )
    `)
    .eq('categories.slug', categorySlug)
    .eq('is_direct_provider', true) // Only show direct service providers in public rankings
    .eq('is_active', true)

  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`)
  }

  // Apply sorting
  switch (sortBy) {
    case 'rating':
      query = query.order('rating', { ascending: false })
      break
    case 'price':
      query = query.order('skills.price', { ascending: true })
      break
    case 'popularity':
      query = query.order('view_count', { ascending: false })
      break
    default:
      query = query.order('position', { ascending: true })
  }

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching providers:', error)
    return []
  }

  return data?.map(provider => ({
    ...provider,
    category_name: provider.categories?.name,
    category_slug: provider.categories?.slug,
    punctuality: provider.skills?.[0]?.punctuality,
    professionalism: provider.skills?.[0]?.professionalism,
    reliability: provider.skills?.[0]?.reliability,
    price: provider.skills?.[0]?.price,
    client_satisfaction: provider.skills?.[0]?.client_satisfaction
  })) || []
}

/**
 * Get providers by category with pagination
 * Returns providers along with pagination metadata
 */
export async function getProvidersByCategoryPaginated(
  categorySlug: string,
  searchQuery?: string,
  sortBy: 'rating' | 'price' | 'popularity' = 'rating',
  page: number = 1,
  pageSize: number = 20
): Promise<{
  providers: Provider[]
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}> {
  // First get the category_id from the slug
  const { data: categoryData } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single()

  if (!categoryData) {
    console.error('Category not found:', categorySlug)
    return {
      providers: [],
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false
    }
  }

  // Build the base query for counting total records
  let countQuery = supabase
    .from('providers')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', categoryData.id)
    .eq('is_direct_provider', true) // Only count direct service providers
    .eq('is_active', true)

  if (searchQuery) {
    countQuery = countQuery.or(`name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`)
  }

  const { count, error: countError } = await countQuery

  if (countError) {
    console.error('Error counting providers:', countError)
    return {
      providers: [],
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false
    }
  }

  const total = count || 0
  const totalPages = Math.ceil(total / pageSize)
  const offset = (page - 1) * pageSize

  // Build the query for fetching providers
  let query = supabase
    .from('providers')
    .select(`
      *,
      categories (
        name,
        slug
      ),
      skills (
        punctuality,
        professionalism,
        reliability,
        price,
        client_satisfaction
      )
    `)
    .eq('category_id', categoryData.id)
    .eq('is_direct_provider', true) // Only show direct service providers in public rankings
    .eq('is_active', true)

  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`)
  }

  // Apply sorting
  switch (sortBy) {
    case 'rating':
      query = query.order('rating', { ascending: false })
      break
    case 'price':
      query = query.order('position', { ascending: true }) // Note: price sorting via skills requires a different approach
      break
    case 'popularity':
      query = query.order('view_count', { ascending: false })
      break
    default:
      query = query.order('position', { ascending: true })
  }

  // Apply pagination
  query = query.range(offset, offset + pageSize - 1)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching providers:', error)
    return {
      providers: [],
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false
    }
  }

  const providers = data?.map(provider => ({
    ...provider,
    category_name: provider.categories?.name,
    category_slug: provider.categories?.slug,
    punctuality: provider.skills?.[0]?.punctuality,
    professionalism: provider.skills?.[0]?.professionalism,
    reliability: provider.skills?.[0]?.reliability,
    price: provider.skills?.[0]?.price,
    client_satisfaction: provider.skills?.[0]?.client_satisfaction
  })) || []

  return {
    providers,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  }
}

/**
 * Get provider count by category slug
 * Returns just the count without fetching all records
 */
export async function getProviderCountByCategory(categorySlug: string): Promise<number> {
  // First get the category_id from the slug
  const { data: categoryData } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single()

  if (!categoryData) {
    console.error('Category not found:', categorySlug)
    return 0
  }

  const { count, error } = await supabase
    .from('providers')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', categoryData.id)
    .eq('is_direct_provider', true) // Only count direct service providers
    .eq('is_active', true)

  if (error) {
    console.error('Error counting providers:', error)
    return 0
  }

  return count || 0
}

/**
 * Get provider counts for all categories
 * Returns a map of category slug to count
 */
export async function getProviderCountsByCategory(): Promise<Record<string, number>> {
  // Get all active categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug')
    .eq('is_active', true)

  if (!categories || categories.length === 0) {
    return {}
  }

  // Get counts for each category
  const counts: Record<string, number> = {}
  
  for (const category of categories) {
    const { count, error } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', category.id)
      .eq('is_direct_provider', true) // Only count direct service providers
      .eq('is_active', true)

    if (!error) {
      counts[category.slug] = count || 0
    }
  }

  return counts
}

export async function getProviderById(id: string): Promise<Provider | null> {
  const { data, error } = await supabase
    .from('providers')
    .select(`
      *,
      categories (
        name,
        slug
      ),
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

  return {
    ...data,
    category_name: data.categories?.name,
    category_slug: data.categories?.slug,
    punctuality: data.skills?.[0]?.punctuality,
    professionalism: data.skills?.[0]?.professionalism,
    reliability: data.skills?.[0]?.reliability,
    price: data.skills?.[0]?.price,
    client_satisfaction: data.skills?.[0]?.client_satisfaction
  }
}

export async function getFeaturedProviders(limit: number = 6): Promise<Provider[]> {
  const { data, error } = await supabase
    .from('providers')
    .select(`
      *,
      categories (
        name,
        slug
      ),
      skills (
        punctuality,
        professionalism,
        reliability,
        price,
        client_satisfaction
      )
    `)
    .eq('featured', true)
    .eq('is_direct_provider', true) // Only show direct service providers
    .eq('is_active', true)
    .order('rating', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching featured providers:', error)
    return []
  }

  return data?.map(provider => ({
    ...provider,
    category_name: provider.categories?.name,
    category_slug: provider.categories?.slug,
    punctuality: provider.skills?.[0]?.punctuality,
    professionalism: provider.skills?.[0]?.professionalism,
    reliability: provider.skills?.[0]?.reliability,
    price: provider.skills?.[0]?.price,
    client_satisfaction: provider.skills?.[0]?.client_satisfaction
  })) || []
}

export async function searchProviders(
  query: string,
  categorySlug?: string,
  limit: number = 20
): Promise<Provider[]> {
  let searchQuery = supabase
    .from('providers')
    .select(`
      *,
      categories (
        name,
        slug
      ),
      skills (
        punctuality,
        professionalism,
        reliability,
        price,
        client_satisfaction
      )
    `)
    .eq('is_direct_provider', true) // Only search direct service providers
    .eq('is_active', true)
    .textSearch('name', query, {
      type: 'websearch',
      config: 'english'
    })

  if (categorySlug) {
    searchQuery = searchQuery.eq('categories.slug', categorySlug)
  }

  searchQuery = searchQuery.limit(limit)

  const { data, error } = await searchQuery

  if (error) {
    console.error('Error searching providers:', error)
    return []
  }

  return data?.map(provider => ({
    ...provider,
    category_name: provider.categories?.name,
    category_slug: provider.categories?.slug,
    punctuality: provider.skills?.[0]?.punctuality,
    professionalism: provider.skills?.[0]?.professionalism,
    reliability: provider.skills?.[0]?.reliability,
    price: provider.skills?.[0]?.price,
    client_satisfaction: provider.skills?.[0]?.client_satisfaction
  })) || []
}

// Reviews
export async function getProviderReviews(providerId: string, limit: number = 10): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('provider_id', providerId)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching reviews:', error)
    return []
  }

  return data || []
}

export async function createReview(review: Omit<Review, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
  const { error } = await supabase
    .from('reviews')
    .insert(review)

  if (error) {
    console.error('Error creating review:', error)
    return false
  }

  return true
}

// Contact Submissions
export async function createContactSubmission(
  submission: Omit<ContactSubmission, 'id' | 'created_at' | 'updated_at'>
): Promise<boolean> {
  const { error } = await supabase
    .from('contact_submissions')
    .insert(submission)

  if (error) {
    console.error('Error creating contact submission:', error)
    return false
  }

  return true
}

// Newsletter
export async function subscribeToNewsletter(
  email: string,
  firstName?: string,
  lastName?: string,
  interests?: string[],
  source?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert({
      email,
      first_name: firstName,
      last_name: lastName,
      interests,
      source,
      status: 'active'
    }, {
      onConflict: 'email'
    })

  if (error) {
    console.error('Error subscribing to newsletter:', error)
    return false
  }

  return true
}

// Blog Posts
export async function getBlogPosts(limit: number = 10, featured?: boolean): Promise<BlogPost[]> {
  let query = supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (featured !== undefined) {
    query = query.eq('is_featured', featured)
  }

  query = query.limit(limit)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }

  return data || []
}

export async function getBlogPostsPaginated(limit: number = 10, offset: number = 0, featured?: boolean): Promise<BlogPost[]> {
  let query = supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (featured !== undefined) {
    query = query.eq('is_featured', featured)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }

  return data || []
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error) {
    console.error('Error fetching blog post:', error)
    return null
  }

  return data
}

// Analytics
export async function trackEvent(
  eventType: string,
  providerId?: string,
  userId?: string,
  sessionId?: string,
  pageUrl?: string,
  referrer?: string,
  userAgent?: string,
  eventData?: any
): Promise<boolean> {
  const { error } = await supabase
    .from('analytics_events')
    .insert({
      event_type: eventType,
      provider_id: providerId,
      user_id: userId,
      session_id: sessionId,
      page_url: pageUrl,
      referrer: referrer,
      user_agent: userAgent,
      event_data: eventData
    })

  if (error) {
    console.error('Error tracking event:', error)
    return false
  }

  return true
}

// Provider Stats
export async function incrementProviderView(providerId: string): Promise<boolean> {
  const { error } = await supabase.rpc('increment_provider_view', {
    provider_id: providerId
  })

  if (error) {
    console.error('Error incrementing provider view:', error)
    return false
  }

  return true
}

export async function incrementProviderContact(providerId: string): Promise<boolean> {
  const { error } = await supabase.rpc('increment_provider_contact', {
    provider_id: providerId
  })

  if (error) {
    console.error('Error incrementing provider contact:', error)
    return false
  }

  return true
}
