  /**
 * Google Places API Service
 * Fetches business data from Google Places API
 */

export interface GooglePlaceData {
  place_id: string
  name: string
  rating?: number
  user_ratings_total?: number
  formatted_address?: string
  international_phone_number?: string
  website?: string
  photos?: Array<{ photo_reference: string }>
  types?: string[]
  geometry?: {
    location: {
      lat: number
      lng: number
    }
  }
}

export interface GooglePlaceDetails {
  place_id: string
  name: string
  rating: number
  user_ratings_total: number
  formatted_address: string
  phone?: string
  website?: string
  photo_url?: string
  categories: string[]
  latitude?: number
  longitude?: number
}

export class GooglePlacesService {
  private apiKey: string
  private baseUrl = 'https://maps.googleapis.com/maps/api/place'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_PLACES_API_KEY || ''
    if (!this.apiKey) {
      throw new Error('GOOGLE_PLACES_API_KEY is required')
    }
  }

  /**
   * Search for a place by name and location
   */
  async searchPlace(
    query: string,
    location: string = 'New York, NY'
  ): Promise<GooglePlaceDetails | null> {
    try {
      // Step 1: Text search to find place_id
      const searchUrl = `${this.baseUrl}/textsearch/json?query=${encodeURIComponent(query + ' ' + location)}&key=${this.apiKey}`
      
      const searchResponse = await fetch(searchUrl)
      if (!searchResponse.ok) {
        throw new Error(`Google Places API error: ${searchResponse.statusText}`)
      }

      const searchData = await searchResponse.json()
      
      if (searchData.status !== 'OK' && searchData.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API error: ${searchData.status} - ${searchData.error_message || ''}`)
      }

      if (searchData.results && searchData.results.length > 0) {
        const place = searchData.results[0]
        const placeId = place.place_id

        // Step 2: Get detailed information
        return await this.getPlaceDetails(placeId)
      }

      return null
    } catch (error) {
      console.error('Error searching Google Places:', error)
      throw error
    }
  }

  /**
   * Get detailed place information by place_id
   */
  async getPlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
    try {
      const fields = [
        'place_id',
        'name',
        'rating',
        'user_ratings_total',
        'formatted_address',
        'international_phone_number',
        'website',
        'photos',
        'types',
        'geometry'
      ].join(',')

      const detailsUrl = `${this.baseUrl}/details/json?place_id=${placeId}&fields=${fields}&key=${this.apiKey}`
      
      const detailsResponse = await fetch(detailsUrl)
      if (!detailsResponse.ok) {
        throw new Error(`Google Places API error: ${detailsResponse.statusText}`)
      }

      const detailsData = await detailsResponse.json()
      
      if (detailsData.status !== 'OK') {
        throw new Error(`Google Places API error: ${detailsData.status} - ${detailsData.error_message || ''}`)
      }

      const result = detailsData.result

      // Get photo URL if available
      let photoUrl: string | undefined
      if (result.photos && result.photos.length > 0) {
        photoUrl = await this.getPhotoUrl(result.photos[0].photo_reference)
      }

      // Extract categories (remove 'establishment' and 'point_of_interest')
      const categories = (result.types || [])
        .filter((type: string) => !['establishment', 'point_of_interest'].includes(type))
        .slice(0, 5)

      return {
        place_id: result.place_id,
        name: result.name,
        rating: result.rating || 0,
        user_ratings_total: result.user_ratings_total || 0,
        formatted_address: result.formatted_address || '',
        phone: result.international_phone_number || result.formatted_phone_number,
        website: result.website,
        photo_url: photoUrl,
        categories,
        latitude: result.geometry?.location?.lat,
        longitude: result.geometry?.location?.lng
      }
    } catch (error) {
      console.error('Error getting Google Place details:', error)
      throw error
    }
  }

  /**
   * Get photo URL from photo reference
   */
  async getPhotoUrl(photoReference: string, maxWidth: number = 400): Promise<string> {
    return `${this.baseUrl}/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${this.apiKey}`
  }

  /**
   * Search multiple places (for bulk import)
   */
  async searchPlaces(
    queries: Array<{ name: string; location?: string }>,
    delayMs: number = 100
  ): Promise<Array<{ query: string; data: GooglePlaceDetails | null; error?: string }>> {
    const results = []

    for (const query of queries) {
      try {
        await new Promise(resolve => setTimeout(resolve, delayMs)) // Rate limiting
        const data = await this.searchPlace(query.name, query.location)
        results.push({ query: query.name, data, error: data ? undefined : 'Not found' })
      } catch (error) {
        results.push({
          query: query.name,
          data: null,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return results
  }
}

// Export singleton instance
export const googlePlacesService = new GooglePlacesService()

