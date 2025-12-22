/**
 * Provider type - represents canonical provider data
 * This is the frontend-facing type
 * API-specific data (Google/Yelp) is stored in provider_sources table
 */
export interface Provider {
  id: string
  name: string
  category: 'djs' | 'photographers' | 'videographers'
  position: number
  rating: number
  verified: boolean
  country: string
  location: string
  image: string
  skills: {
    punctuality: number
    professionalism: number
    reliability: number
    price: number
    clientSatisfaction: number
  }
  bio: string
  portfolio: string[]
  contact: {
    email: string
    phone: string
    website?: string
    instagram?: string
  }
}

/**
 * Provider with source data - for admin/detailed views
 */
export interface ProviderWithSources extends Provider {
  sources: Array<{
    source: 'yelp' | 'google'
    rating: number | null
    review_count: number
    url: string | null
    price_range: string | null
  }>
}

export interface RankingFilters {
  category: string
  searchQuery?: string
  sortBy?: 'rating' | 'price' | 'popularity' | 'position'
}

/**
 * Sync result type for API responses
 */
export interface SyncResult {
  success: boolean
  providerId?: string
  error?: string
}

/**
 * Ingestion result for tracking API fetches
 */
export interface IngestionResult {
  success: boolean
  source: 'yelp' | 'google'
  total: number
  inserted: number
  updated: number
  errors: Array<{ source_provider_id: string; error: string }>
}

/**
 * Match result for provider matching
 */
export interface MatchResult {
  success: boolean
  matches: number
  auto_matches: number
  partial_matches: number
  no_matches: number
}
