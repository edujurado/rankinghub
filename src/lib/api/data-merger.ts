/**
 * Data Merger Service
 * Merges Google Places and Yelp data into unified provider records
 * All data stored in single providers table
 */

import { GooglePlaceDetails } from './google-places'
import { YelpBusinessDetails } from './yelp'
import { supabase } from '../supabase'

export interface MergedProviderData {
  name: string
  category: 'djs' | 'photographers' | 'videographers'
  position: number
  
  // Google data
  google_place_id?: string
  google_rating?: number
  google_review_count?: number
  google_photo_url?: string
  google_address?: string
  google_phone?: string
  google_website?: string
  google_categories?: string[]
  
  // Yelp data (matching actual API response)
  yelp_id?: string
  yelp_alias?: string
  yelp_rating?: number
  yelp_review_count?: number
  yelp_photo_url?: string
  yelp_url?: string
  yelp_address?: string
  yelp_phone?: string
  yelp_display_phone?: string
  yelp_price?: string
  yelp_categories?: string[]
  yelp_is_closed?: boolean
  yelp_transactions?: string[]
  yelp_distance?: number
  
  // Merged fields (best available)
  location: string
  city: string
  state: string
  latitude?: number
  longitude?: number
  image_url?: string
  phone?: string
  website?: string
  
  // Status
  api_sync_status: 'synced' | 'partial' | 'failed' | 'not_found' | 'pending'
  last_synced_at: string
  
  // RH-Score fields (calculated from ratings)
  rh_client_satisfaction?: number
  rh_service_quality?: number
  rh_punctuality?: number
  rh_communication?: number
  rh_value_perceived?: number
  rh_score?: number
  rh_score_calculated_at?: string
}

export class DataMerger {
  /**
   * Merge Google and Yelp data into a unified provider record
   */
  mergeData(
    name: string,
    category: 'djs' | 'photographers' | 'videographers',
    position: number,
    googleData: GooglePlaceDetails | null,
    yelpData: YelpBusinessDetails | null
  ): MergedProviderData {
    // Determine sync status
    let api_sync_status: 'synced' | 'partial' | 'failed' | 'not_found'
    if (googleData && yelpData) {
      api_sync_status = 'synced'
    } else if (googleData || yelpData) {
      api_sync_status = 'partial'
    } else {
      api_sync_status = 'not_found'
    }

    // Merge location data (prefer Google, fallback to Yelp)
    const location = googleData?.formatted_address || yelpData?.address || 'New York, NY'
    const city = 'New York'
    const state = 'NY'
    
    // Merge coordinates (prefer Google, fallback to Yelp)
    const latitude = googleData?.latitude || yelpData?.latitude
    const longitude = googleData?.longitude || yelpData?.longitude

    // Merge image (prefer Google, fallback to Yelp)
    const image_url = googleData?.photo_url || yelpData?.photo_url

    // Merge phone (prefer Google, fallback to Yelp)
    const phone = googleData?.phone || yelpData?.phone

    // Merge website (prefer Google, fallback to Yelp URL)
    const website = googleData?.website || yelpData?.website

    // Calculate RH-Score based on ratings
    const rhScoreData = this.calculateRHScore(googleData?.rating, yelpData?.rating)

    return {
      name,
      category,
      position,
      
      // Google data
      google_place_id: googleData?.place_id,
      google_rating: googleData?.rating,
      google_review_count: googleData?.user_ratings_total,
      google_photo_url: googleData?.photo_url,
      google_address: googleData?.formatted_address,
      google_phone: googleData?.phone,
      google_website: googleData?.website,
      google_categories: googleData?.categories,
      
      // Yelp data
      yelp_id: yelpData?.id,
      yelp_alias: yelpData?.alias,
      yelp_rating: yelpData?.rating,
      yelp_review_count: yelpData?.review_count,
      yelp_photo_url: yelpData?.photo_url,
      yelp_url: yelpData?.url,
      yelp_address: yelpData?.address,
      yelp_phone: yelpData?.phone,
      yelp_display_phone: yelpData?.display_phone,
      yelp_price: yelpData?.price,
      yelp_categories: yelpData?.categories,
      yelp_is_closed: yelpData?.is_closed,
      yelp_transactions: yelpData?.transactions,
      yelp_distance: yelpData?.distance,
      
      // Merged fields
      location,
      city,
      state,
      latitude,
      longitude,
      image_url,
      phone,
      website,
      
      // Status
      api_sync_status,
      last_synced_at: new Date().toISOString(),
      
      // RH-Score
      ...rhScoreData
    }
  }

  /**
   * Calculate RH-Score from Google and Yelp ratings
   */
  calculateRHScore(googleRating?: number, yelpRating?: number): {
    rh_client_satisfaction: number
    rh_service_quality: number
    rh_punctuality: number
    rh_communication: number
    rh_value_perceived: number
    rh_score: number
    rh_score_calculated_at: string
  } {
    // Calculate average rating (convert 0-5 scale to 0-100)
    let avgRating = 80.0 // Default fallback
    
    if (googleRating && googleRating > 0 && yelpRating && yelpRating > 0) {
      avgRating = ((googleRating + yelpRating) / 2.0) * 20.0
    } else if (googleRating && googleRating > 0) {
      avgRating = googleRating * 20.0
    } else if (yelpRating && yelpRating > 0) {
      avgRating = yelpRating * 20.0
    }

    const clientSatisfaction = avgRating
    const serviceQuality = 80.0 // Placeholder
    const punctuality = 80.0 // Placeholder
    const communication = 80.0 // Placeholder
    const valuePerceived = avgRating

    // Calculate weighted RH-Score
    const rhScore = (
      (clientSatisfaction * 0.25) +
      (serviceQuality * 0.25) +
      (punctuality * 0.20) +
      (communication * 0.15) +
      (valuePerceived * 0.15)
    )

    return {
      rh_client_satisfaction: clientSatisfaction,
      rh_service_quality: serviceQuality,
      rh_punctuality: punctuality,
      rh_communication: communication,
      rh_value_perceived: valuePerceived,
      rh_score: rhScore,
      rh_score_calculated_at: new Date().toISOString()
    }
  }

  /**
   * Check if two businesses are duplicates (same Google place_id or Yelp id)
   */
  isDuplicate(
    existing: { google_place_id?: string; yelp_id?: string },
    newData: { google_place_id?: string; yelp_id?: string }
  ): boolean {
    // Check Google place_id match
    if (existing.google_place_id && newData.google_place_id) {
      return existing.google_place_id === newData.google_place_id
    }

    // Check Yelp id match
    if (existing.yelp_id && newData.yelp_id) {
      return existing.yelp_id === newData.yelp_id
    }

    return false
  }

  /**
   * Save merged data to Supabase providers table
   */
  async saveProvider(mergedData: MergedProviderData): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Check for existing provider with same Google place_id or Yelp id
      let existingProvider = null

      if (mergedData.google_place_id) {
        const { data } = await supabase
          .from('providers')
          .select('id, google_place_id, yelp_id')
          .eq('google_place_id', mergedData.google_place_id)
          .single()
        
        if (data) existingProvider = data
      }

      if (!existingProvider && mergedData.yelp_id) {
        const { data } = await supabase
          .from('providers')
          .select('id, google_place_id, yelp_id')
          .eq('yelp_id', mergedData.yelp_id)
          .single()
        
        if (data) existingProvider = data
      }

      // Also check by name + category if no API IDs matched
      if (!existingProvider) {
        // First get category_id from slug
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', mergedData.category)
          .single()

        if (categoryData) {
          const { data } = await supabase
            .from('providers')
            .select('id, google_place_id, yelp_id')
            .eq('name', mergedData.name)
            .eq('category_id', categoryData.id)
            .single()
          
          if (data) existingProvider = data
        }
      }

      if (existingProvider) {
        // Update existing provider
        const { error } = await supabase
          .from('providers')
          .update({
            ...mergedData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProvider.id)

        if (error) {
          return { success: false, error: error.message }
        }

        return { success: true, id: existingProvider.id }
      } else {
        // Insert new provider - need to get category_id first
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', mergedData.category)
          .single()

        if (!categoryData) {
          return { success: false, error: `Category '${mergedData.category}' not found` }
        }

        // Prepare provider data with required fields
        const providerData = {
          name: mergedData.name,
          category_id: categoryData.id,
          position: mergedData.position,
          rating: mergedData.google_rating || mergedData.yelp_rating || 4.0,
          verified: false,
          country: 'USA',
          location: mergedData.location,
          city: mergedData.city,
          state: mergedData.state,
          latitude: mergedData.latitude,
          longitude: mergedData.longitude,
          image_url: mergedData.image_url || '/api/placeholder/150/150',
          bio: `Professional ${mergedData.category === 'djs' ? 'DJ' : mergedData.category === 'photographers' ? 'Photographer' : 'Videographer'} in ${mergedData.city}, ${mergedData.state}`,
          email: `contact@${mergedData.name.toLowerCase().replace(/\s+/g, '')}.com`,
          phone: mergedData.phone || '',
          website: mergedData.website,
          // Google fields
          google_place_id: mergedData.google_place_id,
          google_rating: mergedData.google_rating,
          google_review_count: mergedData.google_review_count,
          google_photo_url: mergedData.google_photo_url,
          google_address: mergedData.google_address,
          google_phone: mergedData.google_phone,
          google_website: mergedData.google_website,
          google_categories: mergedData.google_categories,
          // Yelp fields
          yelp_id: mergedData.yelp_id,
          yelp_alias: mergedData.yelp_alias,
          yelp_rating: mergedData.yelp_rating,
          yelp_review_count: mergedData.yelp_review_count,
          yelp_photo_url: mergedData.yelp_photo_url,
          yelp_url: mergedData.yelp_url,
          yelp_address: mergedData.yelp_address,
          yelp_phone: mergedData.yelp_phone,
          yelp_display_phone: mergedData.yelp_display_phone,
          yelp_price: mergedData.yelp_price,
          yelp_categories: mergedData.yelp_categories,
          yelp_is_closed: mergedData.yelp_is_closed,
          yelp_transactions: mergedData.yelp_transactions,
          yelp_distance: mergedData.yelp_distance,
          // Sync status
          api_sync_status: mergedData.api_sync_status,
          last_synced_at: mergedData.last_synced_at,
          // RH-Score
          rh_client_satisfaction: mergedData.rh_client_satisfaction,
          rh_service_quality: mergedData.rh_service_quality,
          rh_punctuality: mergedData.rh_punctuality,
          rh_communication: mergedData.rh_communication,
          rh_value_perceived: mergedData.rh_value_perceived,
          rh_score: mergedData.rh_score,
          rh_score_calculated_at: mergedData.rh_score_calculated_at
        }

        const { data, error } = await supabase
          .from('providers')
          .insert(providerData)
          .select('id')
          .single()

        if (error) {
          return { success: false, error: error.message }
        }

        return { success: true, id: data.id }
      }
    } catch (error) {
      console.error('Error saving provider:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

export const dataMerger = new DataMerger()
