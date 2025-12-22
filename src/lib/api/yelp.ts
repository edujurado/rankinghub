/**
 * Yelp Fusion API Service
 * Fetches business data from Yelp Fusion API
 */

export interface YelpBusiness {
  id: string
  alias?: string
  name: string
  image_url?: string
  is_closed?: boolean
  url?: string
  review_count?: number
  categories?: Array<{
    alias: string
    title: string
  }>
  rating?: number
  coordinates?: {
    latitude: number
    longitude: number
  }
  transactions?: string[]
  price?: string
  location?: {
    address1?: string
    address2?: string
    address3?: string
    city?: string
    state?: string
    zip_code?: string
    country?: string
    display_address?: string[]
  }
  phone?: string
  display_phone?: string
  distance?: number
  business_hours?: Array<{
    open: Array<{
      is_overnight: boolean
      start: string
      end: string
      day: number
    }>
    hours_type: string
    is_open_now: boolean
  }>
  attributes?: Record<string, unknown>
  photos?: string[]
}

export interface YelpBusinessDetails {
  id: string
  alias?: string
  name: string
  rating: number
  review_count: number
  photo_url?: string
  url?: string
  address: string
  phone?: string
  display_phone?: string
  website?: string
  categories: string[]
  latitude?: number
  longitude?: number
  price?: string
  is_closed?: boolean
  transactions?: string[]
  distance?: number
}

export class YelpService {
  private apiKey: string
  private baseUrl = 'https://api.yelp.com/v3'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.YELP_API_KEY || ''
    if (!this.apiKey) {
      throw new Error('YELP_API_KEY is required')
    }
  }

  /**
   * Search for businesses
   */
  async searchBusiness(
    term: string,
    location: string = 'New York, NY',
    limit: number = 1
  ): Promise<YelpBusinessDetails | null> {
    try {
      const url = `${this.baseUrl}/businesses/search?term=${encodeURIComponent(term)}&location=${encodeURIComponent(location)}&limit=${limit}`
      console.log("url =>", url);
      
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Yelp API error: ${response.status} - ${errorData.error?.description || response.statusText}`)
      }

      const data = await response.json()
      console.log("data =>", data);
      

      if (data.businesses && data.businesses.length > 0) {
        const business = data.businesses[0]
        return this.formatBusinessDetails(business)
      }

      return null
    } catch (error) {
      console.error('Error searching Yelp:', error)
      throw error
    }
  }

  /**
   * Get business details by ID
   */
  async getBusinessDetails(businessId: string): Promise<YelpBusinessDetails | null> {
    try {
      const url = `${this.baseUrl}/businesses/${businessId}`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Yelp API error: ${response.status} - ${errorData.error?.description || response.statusText}`)
      }

      const business = await response.json()
      return this.formatBusinessDetails(business)
    } catch (error) {
      console.error('Error getting Yelp business details:', error)
      throw error
    }
  }

  /**
   * Format Yelp business data to our standard format
   */
  private formatBusinessDetails(business: YelpBusiness): YelpBusinessDetails {
    const address = business.location?.display_address?.join(', ') || 
                   `${business.location?.address1 || ''} ${business.location?.city || ''} ${business.location?.state || ''}`.trim() ||
                   'New York, NY'

    const categories = (business.categories || []).map(cat => cat.title)

    return {
      id: business.id,
      alias: business.alias,
      name: business.name,
      rating: business.rating || 0,
      review_count: business.review_count || 0,
      photo_url: business.image_url || business.photos?.[0],
      url: business.url,
      address,
      phone: business.phone,
      display_phone: business.display_phone,
      website: business.url, // Yelp URL as website
      categories,
      latitude: business.coordinates?.latitude,
      longitude: business.coordinates?.longitude,
      price: business.price,
      is_closed: business.is_closed,
      transactions: business.transactions,
      distance: business.distance
    }
  }

  /**
   * Search multiple businesses (for bulk import)
   */
  async searchBusinesses(
    queries: Array<{ name: string; location?: string }>,
    delayMs: number = 100
  ): Promise<Array<{ query: string; data: YelpBusinessDetails | null; error?: string }>> {
    const results = []

    for (const query of queries) {
      try {
        await new Promise(resolve => setTimeout(resolve, delayMs)) // Rate limiting
        const data = await this.searchBusiness(query.name, query.location)
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
export const yelpService = new YelpService()
