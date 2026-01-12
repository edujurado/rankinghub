/**
 * Ingestion Service
 * Fetches provider data from Yelp and Google Places APIs
 * Stores raw data in provider_sources table
 * NEVER writes directly to providers table
 */

import { supabase } from '../supabase'
import { YelpBusiness } from './yelp'

// ============================================================================
// TYPES
// ============================================================================

export interface ProviderSourceRecord {
  id?: string
  source: 'yelp' | 'google'
  source_provider_id: string
  provider_id?: string | null
  category_slug: string
  
  // Normalized fields
  name: string
  phone_normalized: string | null
  address: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  country: string
  latitude: number | null
  longitude: number | null
  rating: number | null
  review_count: number
  price_range: string | null
  photo_url: string | null
  website: string | null
  categories: string[]
  
  // Yelp-specific fields
  yelp_alias?: string | null
  yelp_url?: string | null
  yelp_display_phone?: string | null
  yelp_is_closed?: boolean | null
  yelp_transactions?: string[] | null
  yelp_distance?: number | null
  yelp_business_hours?: Record<string, unknown> | null
  yelp_attributes?: Record<string, unknown> | null
  yelp_image_url?: string | null
  
  // Google-specific fields
  google_formatted_address?: string | null
  google_types?: string[] | null
  google_international_phone?: string | null
  google_photos?: Record<string, unknown>[] | null
  google_viewport?: Record<string, unknown> | null
  google_html_attributions?: string[] | null
  
  // Raw data
  raw_data: Record<string, unknown>
  fetched_at?: string
}

export interface IngestionResult {
  success: boolean
  source: 'yelp' | 'google'
  total: number
  inserted: number
  updated: number
  errors: Array<{ source_provider_id: string; error: string }>
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Normalize phone number - extract digits only
 */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null
  const digits = phone.replace(/[^0-9]/g, '')
  // Return null if too short to be valid
  if (digits.length < 7) return null
  return digits
}

/**
 * Normalize address - trim and standardize
 */
export function normalizeAddress(address: string | null | undefined): string | null {
  if (!address) return null
  return address.trim().replace(/\s+/g, ' ')
}

/**
 * Map internal category to Yelp search term
 */
function categoryToYelpTerm(category: string): string {
  const mapping: Record<string, string> = {
    'djs': 'DJ',
    'photographers': 'photographer',
    'videographers': 'videographer'
  }
  return mapping[category] || category
}

/**
 * Map internal category to Google Places search term
 */
function categoryToGoogleTerm(category: string): string {
  const mapping: Record<string, string> = {
    'djs': 'DJ services',
    'photographers': 'photography studio',
    'videographers': 'video production'
  }
  return mapping[category] || category
}

// ============================================================================
// INGESTION SERVICE CLASS
// ============================================================================

export class IngestionService {
  // ==========================================================================
  // YELP INGESTION
  // ==========================================================================

  /**
   * Fetch providers from Yelp API with pagination support
   * Yelp API limits: 50 per request, max offset 1000 (so max ~1000 total results)
   * Idempotent - uses upsert by (source, source_provider_id)
   */
  async fetchYelpProviders(
    category: string,
    location: string = 'New York, NY',
    limit: number = 50
  ): Promise<IngestionResult> {
    const result: IngestionResult = {
      success: true,
      source: 'yelp',
      total: 0,
      inserted: 0,
      updated: 0,
      errors: []
    }

    try {
      const apiKey = process.env.YELP_API_KEY
      if (!apiKey) {
        throw new Error('YELP_API_KEY is required')
      }

      const searchTerm = categoryToYelpTerm(category)
      const maxResultsPerPage = 50 // Yelp API maximum per request
      const maxTotalResults = Math.min(limit, 1000) // Yelp API max is ~1000 total
      
      let offset = 0
      let hasMore = true
      let totalFetched = 0

      while (hasMore && totalFetched < maxTotalResults) {
        const pageLimit = Math.min(maxResultsPerPage, maxTotalResults - totalFetched)
        const url = `https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(searchTerm)}&location=${encodeURIComponent(location)}&limit=${pageLimit}&offset=${offset}`

        console.log(`[Yelp Ingestion] Fetching page: offset=${offset}, limit=${pageLimit} (total fetched: ${totalFetched}/${maxTotalResults})`)

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(`Yelp API error: ${response.status} - ${errorData.error?.description || response.statusText}`)
        }

        const data = await response.json()
        console.log("yelp data =>", data);
        
        const businesses: YelpBusiness[] = data.businesses || []
        
        if (businesses.length === 0) {
          hasMore = false
          break
        }

        console.log(`[Yelp Ingestion] Fetched ${businesses.length} businesses (offset: ${offset})`)

        // Process each business
        for (const business of businesses) {
          try {
            const sourceRecord = this.transformYelpToSource(business, category)
            const upsertResult = await this.upsertProviderSource(sourceRecord)

            if (upsertResult.inserted) {
              result.inserted++
            } else if (upsertResult.updated) {
              result.updated++
            }
            totalFetched++
          } catch (error) {
            result.errors.push({
              source_provider_id: business.id,
              error: error instanceof Error ? error.message : 'Unknown error'
            })
          }
        }

        // Check if we should continue paginating
        if (businesses.length < pageLimit || totalFetched >= maxTotalResults) {
          hasMore = false
        } else {
          offset += pageLimit
          // Rate limiting: small delay between requests
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }

      result.total = totalFetched
      console.log(`[Yelp Ingestion] Completed: ${result.inserted} inserted, ${result.updated} updated, ${result.errors.length} errors, total: ${totalFetched}`)

    } catch (error) {
      console.error('[Yelp Ingestion] Fatal error:', error)
      result.success = false
      result.errors.push({
        source_provider_id: 'N/A',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    return result
  }

  /**
   * Transform Yelp API response to provider_sources record
   * Based on actual Yelp API response structure:
   * {
   *   id, alias, name, image_url, is_closed, url, review_count,
   *   categories: [{ alias, title }], rating, coordinates: { latitude, longitude },
   *   transactions: [], price, location: { address1, address2, address3, city, zip_code, country, state, display_address: [] },
   *   phone, display_phone, distance, business_hours: [], attributes: {}
   * }
   */
  private transformYelpToSource(business: YelpBusiness, category: string): ProviderSourceRecord {
    // Build full address from display_address or components
    const displayAddress = business.location?.display_address?.join(', ')
    const address = displayAddress || 
      [business.location?.address1, business.location?.city, business.location?.state, business.location?.zip_code]
        .filter(Boolean).join(', ')

    return {
      source: 'yelp',
      source_provider_id: business.id,
      category_slug: category,
      
      // Normalized fields
      name: business.name,
      phone_normalized: normalizePhone(business.phone),
      address: normalizeAddress(address),
      address_line1: business.location?.address1 || null,
      address_line2: business.location?.address2 || null,
      city: business.location?.city || null,
      state: business.location?.state || null,
      zip_code: business.location?.zip_code || null,
      country: business.location?.country || 'US',
      latitude: business.coordinates?.latitude || null,
      longitude: business.coordinates?.longitude || null,
      rating: business.rating || null,
      review_count: business.review_count || 0,
      price_range: business.price || null,
      photo_url: business.image_url || null,
      website: null, // Yelp doesn't provide actual website in search results
      categories: (business.categories || []).map(c => c.title),
      
      // Yelp-specific fields
      yelp_alias: business.alias || null,
      yelp_url: business.url || null,
      yelp_display_phone: business.display_phone || null,
      yelp_is_closed: business.is_closed || false,
      yelp_transactions: business.transactions || null,
      yelp_distance: business.distance || null,
      yelp_business_hours: business.business_hours as unknown as Record<string, unknown> || null,
      yelp_attributes: business.attributes as Record<string, unknown> || null,
      yelp_image_url: business.image_url || null,
      
      // Raw data for audit
      raw_data: business as unknown as Record<string, unknown>
    }
  }

  // ==========================================================================
  // GOOGLE PLACES INGESTION
  // ==========================================================================

  /**
   * Fetch providers from Google Places API with pagination support
   * Google Places API limits: 20 per request, uses pagetoken for pagination
   * Idempotent - uses upsert by (source, source_provider_id)
   */
  async fetchGoogleProviders(
    category: string,
    location: string = 'New York, NY',
    limit: number = 50
  ): Promise<IngestionResult> {
    const result: IngestionResult = {
      success: true,
      source: 'google',
      total: 0,
      inserted: 0,
      updated: 0,
      errors: []
    }

    try {
      const apiKey = process.env.GOOGLE_PLACES_API_KEY
      if (!apiKey) {
        throw new Error('GOOGLE_PLACES_API_KEY is required')
      }

      const searchTerm = categoryToGoogleTerm(category)
      let nextPageToken: string | null = null
      let totalFetched = 0
      let hasMore = true

      while (hasMore && totalFetched < limit) {
        // Build URL with pagetoken if available
        let searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchTerm + ' ' + location)}&key=${apiKey}`
        
        if (nextPageToken) {
          // Wait a few seconds before using pagetoken (Google requirement)
          console.log(`[Google Ingestion] Waiting 2 seconds before fetching next page...`)
          await new Promise(resolve => setTimeout(resolve, 2000))
          searchUrl += `&pagetoken=${encodeURIComponent(nextPageToken)}`
        }

        console.log(`[Google Ingestion] Fetching page: ${nextPageToken ? 'pagetoken=' + nextPageToken.substring(0, 20) + '...' : 'first page'} (total fetched: ${totalFetched}/${limit})`)

        const searchResponse = await fetch(searchUrl)
        if (!searchResponse.ok) {
          throw new Error(`Google Places API error: ${searchResponse.statusText}`)
        }

        const searchData = await searchResponse.json()
        console.log("google data =>", searchData);
        

        if (searchData.status !== 'OK' && searchData.status !== 'ZERO_RESULTS') {
          // If pagetoken error, try to continue with first page again
          if (searchData.status === 'INVALID_REQUEST' && nextPageToken) {
            console.log(`[Google Ingestion] Pagetoken expired or invalid, stopping pagination`)
            hasMore = false
            break
          }
          throw new Error(`Google Places API error: ${searchData.status} - ${searchData.error_message || ''}`)
        }

        const places = searchData.results || []
        
        if (places.length === 0) {
          hasMore = false
          break
        }

        console.log(`[Google Ingestion] Fetched ${places.length} places from search results`)

        // Process each place - get detailed info
        for (const place of places) {
          if (totalFetched >= limit) {
            hasMore = false
            break
          }

          try {
            // Get detailed place information
            const details = await this.getGooglePlaceDetails(place.place_id, apiKey)
            
            if (details) {
              const sourceRecord = this.transformGoogleToSource(details, category, apiKey)
              const upsertResult = await this.upsertProviderSource(sourceRecord)

              if (upsertResult.inserted) {
                result.inserted++
              } else if (upsertResult.updated) {
                result.updated++
              }
              totalFetched++
            }

            // Rate limiting - small delay between detail requests
            await new Promise(resolve => setTimeout(resolve, 100))

          } catch (error) {
            result.errors.push({
              source_provider_id: place.place_id,
              error: error instanceof Error ? error.message : 'Unknown error'
            })
          }
        }

        // Check for next page token
        nextPageToken = searchData.next_page_token || null
        if (!nextPageToken || totalFetched >= limit) {
          hasMore = false
        }

        // Rate limiting between search pages
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      result.total = totalFetched
      console.log(`[Google Ingestion] Completed: ${result.inserted} inserted, ${result.updated} updated, ${result.errors.length} errors, total: ${totalFetched}`)

    } catch (error) {
      console.error('[Google Ingestion] Fatal error:', error)
      result.success = false
      result.errors.push({
        source_provider_id: 'N/A',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    return result
  }

  /**
   * Get detailed place information from Google Places API
   * Response structure:
   * {
   *   html_attributions: [],
   *   result: {
   *     formatted_address, geometry: { location: { lat, lng }, viewport },
   *     international_phone_number, name, photos: [], place_id,
   *     rating, types: [], user_ratings_total, website, ...
   *   },
   *   status: 'OK'
   * }
   */
  private async getGooglePlaceDetails(placeId: string, apiKey: string): Promise<Record<string, unknown> | null> {
    const fields = [
      'place_id',
      'name',
      'rating',
      'user_ratings_total',
      'formatted_address',
      'international_phone_number',
      'formatted_phone_number',
      'website',
      'photos',
      'types',
      'geometry',
      'price_level',
      'address_components'
    ].join(',')

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`

    const response = await fetch(detailsUrl)
    if (!response.ok) {
      throw new Error(`Google Places Details API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    console.log(`[Google Ingestion] Detail response for ${placeId}:`, JSON.stringify(data).slice(0, 200))
    
    if (data.status !== 'OK') {
      throw new Error(`Google Places Details API error: ${data.status} - ${data.error_message || ''}`)
    }

    // Return the full response including html_attributions
    return {
      ...data.result,
      html_attributions: data.html_attributions || []
    }
  }

  /**
   * Transform Google Places API response to provider_sources record
   * Based on actual Google Places API response structure:
   * {
   *   formatted_address, geometry: { location: { lat, lng }, viewport },
   *   international_phone_number, name, photos: [{ photo_reference, ... }],
   *   place_id, rating, types: [], user_ratings_total, website,
   *   address_components: [{ long_name, short_name, types: [] }]
   * }
   */
  private transformGoogleToSource(place: Record<string, unknown>, category: string, apiKey: string): ProviderSourceRecord {
    const geometry = place.geometry as { location?: { lat: number; lng: number }; viewport?: Record<string, unknown> } | undefined
    const addressComponents = place.address_components as Array<{ long_name: string; short_name: string; types: string[] }> | undefined

    // Extract city, state, zip from address components
    let city: string | null = null
    let state: string | null = null
    let zipCode: string | null = null
    let country = 'US'
    let streetNumber = ''
    let route = ''

    if (addressComponents) {
      for (const component of addressComponents) {
        if (component.types.includes('locality')) {
          city = component.long_name
        }
        if (component.types.includes('administrative_area_level_1')) {
          state = component.short_name
        }
        if (component.types.includes('postal_code')) {
          zipCode = component.long_name
        }
        if (component.types.includes('country')) {
          country = component.short_name
        }
        if (component.types.includes('street_number')) {
          streetNumber = component.long_name
        }
        if (component.types.includes('route')) {
          route = component.long_name
        }
      }
    }

    // Build address line 1
    const addressLine1 = [streetNumber, route].filter(Boolean).join(' ') || null

    // Get photo URL if available
    let photoUrl: string | null = null
    const photos = place.photos as Array<{ photo_reference: string }> | undefined
    if (photos && photos.length > 0) {
      photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photos[0].photo_reference}&key=${apiKey}`
    }

    // Map price_level (0-4) to price range string
    const priceLevel = place.price_level as number | undefined
    let priceRange: string | null = null
    if (priceLevel !== undefined && priceLevel > 0) {
      priceRange = '$'.repeat(priceLevel)
    }

    const internationalPhone = place.international_phone_number as string | undefined
    const types = place.types as string[] | undefined

    return {
      source: 'google',
      source_provider_id: place.place_id as string,
      category_slug: category,
      
      // Normalized fields
      name: place.name as string,
      phone_normalized: normalizePhone(internationalPhone),
      address: normalizeAddress(place.formatted_address as string),
      address_line1: addressLine1,
      address_line2: null,
      city,
      state,
      zip_code: zipCode,
      country,
      latitude: geometry?.location?.lat || null,
      longitude: geometry?.location?.lng || null,
      rating: (place.rating as number) || null,
      review_count: (place.user_ratings_total as number) || 0,
      price_range: priceRange,
      photo_url: photoUrl,
      website: (place.website as string) || null,
      categories: (types || []).filter(t => !['establishment', 'point_of_interest'].includes(t)),
      
      // Google-specific fields
      google_formatted_address: (place.formatted_address as string) || null,
      google_types: types || null,
      google_international_phone: internationalPhone || null,
      google_photos: photos as Record<string, unknown>[] || null,
      google_viewport: geometry?.viewport || null,
      google_html_attributions: (place.html_attributions as string[]) || null,
      
      // Raw data for audit
      raw_data: place
    }
  }

  // ==========================================================================
  // DATABASE OPERATIONS
  // ==========================================================================

  /**
   * Upsert a provider source record
   * Idempotent by (source, source_provider_id)
   */
  private async upsertProviderSource(
    record: ProviderSourceRecord
  ): Promise<{ inserted: boolean; updated: boolean; id?: string }> {
    // Check if record exists
    const { data: existing } = await supabase
      .from('provider_sources')
      .select('id, provider_id')
      .eq('source', record.source)
      .eq('source_provider_id', record.source_provider_id)
      .single()

    if (existing) {
      // Update existing record but preserve provider_id link
      const { error } = await supabase
        .from('provider_sources')
        .update({
          ...record,
          provider_id: existing.provider_id, // Preserve existing link
          fetched_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)

      if (error) {
        throw new Error(`Failed to update provider_source: ${error.message}`)
      }

      return { inserted: false, updated: true, id: existing.id }
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from('provider_sources')
        .insert({
          ...record,
          fetched_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (error) {
        throw new Error(`Failed to insert provider_source: ${error.message}`)
      }

      return { inserted: true, updated: false, id: data.id }
    }
  }

  // ==========================================================================
  // BATCH OPERATIONS
  // ==========================================================================

  /**
   * Fetch providers from both sources for all categories
   */
  async fetchAllProviders(
    location: string = 'New York, NY',
    limit: number = 50
  ): Promise<{ yelp: IngestionResult[]; google: IngestionResult[] }> {
    const categories = ['djs', 'photographers', 'videographers']
    const yelpResults: IngestionResult[] = []
    const googleResults: IngestionResult[] = []

    for (const category of categories) {
      console.log(`[Ingestion] Processing category: ${category}`)

      // Fetch from Yelp
      const yelpResult = await this.fetchYelpProviders(category, location, limit)
      yelpResults.push(yelpResult)

      // Small delay between API calls
      await new Promise(resolve => setTimeout(resolve, 200))

      // Fetch from Google
      const googleResult = await this.fetchGoogleProviders(category, location, limit)
      googleResults.push(googleResult)

      // Delay between categories
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    return { yelp: yelpResults, google: googleResults }
  }

  /**
   * Get statistics about provider_sources
   */
  async getIngestionStats(): Promise<{
    total: number
    bySource: { yelp: number; google: number }
    byCategory: Record<string, number>
    linked: number
    unlinked: number
  }> {
    const { data: sources } = await supabase
      .from('provider_sources')
      .select('source, category_slug, provider_id')

    if (!sources) {
      return {
        total: 0,
        bySource: { yelp: 0, google: 0 },
        byCategory: {},
        linked: 0,
        unlinked: 0
      }
    }

    const stats = {
      total: sources.length,
      bySource: { yelp: 0, google: 0 },
      byCategory: {} as Record<string, number>,
      linked: 0,
      unlinked: 0
    }

    for (const source of sources) {
      if (source.source === 'yelp') stats.bySource.yelp++
      if (source.source === 'google') stats.bySource.google++

      stats.byCategory[source.category_slug] = (stats.byCategory[source.category_slug] || 0) + 1

      if (source.provider_id) {
        stats.linked++
      } else {
        stats.unlinked++
      }
    }

    return stats
  }
}

// Export singleton instance
export const ingestionService = new IngestionService()
