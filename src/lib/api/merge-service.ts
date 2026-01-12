/**
 * Merge Service
 * Synthesizes canonical provider records from matched Yelp and Google sources
 * Implements deterministic field merge rules
 * Preserves manual edits and engagement metrics
 * 
 * IMPORTANT: 
 * - providers table contains ONLY canonical/merged fields
 * - API-specific data stays in provider_sources
 * - Confidence scores go to provider_matches
 */

import { supabase } from '../supabase'
import { MatchCandidate, MatchedFieldsBreakdown, matchingService } from './matching-service'
import { ProviderSourceData } from './matching-service'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Canonical provider fields - only fields that exist in providers table
 * NO API-specific fields (those stay in provider_sources)
 */
export interface MergedProviderFields {
  name: string
  rating: number
  location: string
  city: string | null
  state: string | null
  zip_code: string | null
  country: string
  latitude: number | null
  longitude: number | null
  phone: string | null
  website: string | null
  image_url: string | null
  price_range: string | null
  social_proof_count: number
  verified: boolean
  featured: boolean
}

export interface MergeResult {
  success: boolean
  provider_id: string | null
  action: 'created' | 'updated' | 'skipped'
  confidence_score: number
  match_type: 'auto' | 'partial' | 'manual' | 'single_source'
  error?: string
}

export interface MergeAllResult {
  success: boolean
  total_processed: number
  providers_created: number
  providers_updated: number
  matches_recorded: number
  single_source_created: number
  errors: Array<{ source_id: string; error: string }>
}

// Fields that should never be overwritten by sync
const PRESERVED_FIELDS = [
  'view_count',
  'contact_count',
  'is_claimed',
  'claimed_at',
  'bio',
  'short_bio',
  'email',
  'instagram',
  'facebook',
  'twitter',
  'youtube',
  'tiktok',
  'linkedin',
  'years_experience',
  'languages',
  'service_areas',
  'specialties',
  'equipment_list',
  'awards',
  'certifications',
  'portfolio_images',
  'portfolio_videos',
  'availability_status'
] as const

// ============================================================================
// MERGE SERVICE CLASS
// ============================================================================

export class MergeService {
  // ==========================================================================
  // FIELD MERGE RULES
  // ==========================================================================

  /**
   * Merge fields from two sources according to deterministic rules
   * Returns ONLY canonical fields that exist in providers table
   */
  mergeSourceFields(
    googleSource: ProviderSourceData | null,
    yelpSource: ProviderSourceData | null,
    confidenceScore: number
  ): MergedProviderFields {
    // Name: Prefer Google
    const name = googleSource?.name || yelpSource?.name || 'Unknown Provider'

    // Rating: Weighted average by review_count
    const rating = this.calculateWeightedRating(
      googleSource?.rating,
      googleSource?.review_count || 0,
      yelpSource?.rating,
      yelpSource?.review_count || 0
    )

    // Location fields: Prefer Google
    const location = googleSource?.address || yelpSource?.address || 'New York, NY'
    const city = googleSource?.city || yelpSource?.city || 'New York'
    const state = googleSource?.state || yelpSource?.state || 'NY'
    const zipCode = googleSource?.zip_code || yelpSource?.zip_code || null
    const country = googleSource?.country || yelpSource?.country || 'USA'
    const latitude = googleSource?.latitude ?? yelpSource?.latitude ?? null
    const longitude = googleSource?.longitude ?? yelpSource?.longitude ?? null

    // Phone: Prefer Google
    const phone = this.formatPhone(googleSource?.phone_normalized || yelpSource?.phone_normalized)

    // Website: Prefer Google (actual website), not Yelp URL
    const website = googleSource?.website || 
      (yelpSource?.website && !yelpSource.website.includes('yelp.com') ? yelpSource.website : null)

    // Image: Prefer Google
    const imageUrl = googleSource?.photo_url || yelpSource?.photo_url || '/api/placeholder/150/150'

    // Price range: Prefer Yelp (more standardized)
    const priceRange = yelpSource?.price_range || googleSource?.price_range || null

    // Social proof: Sum of review counts
    const socialProofCount = (googleSource?.review_count || 0) + (yelpSource?.review_count || 0)

    // Verified: TRUE if confidence >= 0.9
    const verified = confidenceScore >= 0.9

    // Featured: FALSE for auto-created (can be manually set later)
    const featured = false

    return {
      name,
      rating,
      location,
      city,
      state,
      zip_code: zipCode,
      country,
      latitude,
      longitude,
      phone,
      website,
      image_url: imageUrl,
      price_range: priceRange,
      social_proof_count: socialProofCount,
      verified,
      featured
    }
  }

  /**
   * Calculate weighted average rating based on review counts
   */
  private calculateWeightedRating(
    googleRating: number | null | undefined,
    googleReviewCount: number,
    yelpRating: number | null | undefined,
    yelpReviewCount: number
  ): number {
    const gRating = googleRating || 0
    const yRating = yelpRating || 0
    const totalReviews = googleReviewCount + yelpReviewCount

    if (totalReviews === 0) {
      // If no reviews, average the ratings if both exist
      if (gRating > 0 && yRating > 0) {
        return Math.round(((gRating + yRating) / 2) * 10) / 10
      }
      return gRating || yRating || 4.0 // Default rating
    }

    // Weighted average
    const weightedSum = (gRating * googleReviewCount) + (yRating * yelpReviewCount)
    return Math.round((weightedSum / totalReviews) * 10) / 10
  }

  /**
   * Format phone number for display
   */
  private formatPhone(normalizedPhone: string | null | undefined): string | null {
    if (!normalizedPhone) return null

    // Format US phone numbers
    if (normalizedPhone.length === 10) {
      return `+1 (${normalizedPhone.slice(0, 3)}) ${normalizedPhone.slice(3, 6)}-${normalizedPhone.slice(6)}`
    }
    if (normalizedPhone.length === 11 && normalizedPhone.startsWith('1')) {
      return `+1 (${normalizedPhone.slice(1, 4)}) ${normalizedPhone.slice(4, 7)}-${normalizedPhone.slice(7)}`
    }

    // Return as-is if not US format
    return normalizedPhone
  }

  // ==========================================================================
  // PROVIDER OPERATIONS
  // ==========================================================================

  /**
   * Create or update a provider from matched sources
   */
  async mergeMatchedSources(match: MatchCandidate): Promise<MergeResult> {
    const { source, candidate, confidence_score, match_type, matched_fields } = match

    // Convert match_type to result type (exclude 'none' since matched sources won't have it)
    const resultMatchType: 'auto' | 'partial' | 'manual' = 
      match_type === 'none' ? 'partial' : match_type

    // Determine which is Google and which is Yelp
    const googleSource = source.source === 'google' ? source : candidate
    const yelpSource = source.source === 'yelp' ? source : candidate

    // Merge fields
    const mergedFields = this.mergeSourceFields(googleSource, yelpSource, confidence_score)

    try {
      // Check if either source is already linked to a provider
      let existingProviderId: string | null = null

      if (googleSource.provider_id) {
        existingProviderId = googleSource.provider_id
      } else if (yelpSource.provider_id) {
        existingProviderId = yelpSource.provider_id
      }

      let providerId: string
      let action: 'created' | 'updated'

      if (existingProviderId) {
        // Update existing provider (preserving certain fields)
        await this.updateProvider(existingProviderId, mergedFields)
        providerId = existingProviderId
        action = 'updated'
      } else {
        // Create new provider
        providerId = await this.createProvider(mergedFields, googleSource.category_slug)
        action = 'created'
      }

      // Link sources to provider
      await this.linkSourcesToProvider(providerId, googleSource.id, yelpSource.id)

      // Record match in provider_matches
      await this.recordMatch(providerId, googleSource, confidence_score, resultMatchType, matched_fields)
      await this.recordMatch(providerId, yelpSource, confidence_score, resultMatchType, matched_fields)

      return {
        success: true,
        provider_id: providerId,
        action,
        confidence_score,
        match_type: resultMatchType
      }
    } catch (error) {
      console.error('[Merge] Error merging sources:', error)
      return {
        success: false,
        provider_id: null,
        action: 'skipped',
        confidence_score,
        match_type: resultMatchType,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Create provider from single source (no match found)
   */
  async createFromSingleSource(source: ProviderSourceData): Promise<MergeResult> {
    const googleSource = source.source === 'google' ? source : null
    const yelpSource = source.source === 'yelp' ? source : null

    // Merge fields (one source will be null)
    const mergedFields = this.mergeSourceFields(googleSource, yelpSource, 0)
    mergedFields.verified = false // Single source = not verified
    mergedFields.featured = false

    try {
      // Check if source is already linked to a provider
      if (source.provider_id) {
        // Already linked, just update
        await this.updateProvider(source.provider_id, mergedFields)
        return {
          success: true,
          provider_id: source.provider_id,
          action: 'updated',
          confidence_score: 0,
          match_type: 'single_source'
        }
      }

      // Create new provider
      const providerId = await this.createProvider(mergedFields, source.category_slug)

      // Link source to provider
      await this.linkSourcesToProvider(providerId, source.id)

      // Record single-source match
      await this.recordMatch(providerId, source, 0, 'auto', {
        name_score: 0,
        phone_match: false,
        phone_score: 0,
        address_score: 0,
        website_match: false,
        website_score: 0,
        geo_distance_meters: null,
        geo_score: 0,
        total_score: 0
      })

      return {
        success: true,
        provider_id: providerId,
        action: 'created',
        confidence_score: 0,
        match_type: 'single_source'
      }
    } catch (error) {
      console.error('[Merge] Error creating from single source:', error)
      return {
        success: false,
        provider_id: null,
        action: 'skipped',
        confidence_score: 0,
        match_type: 'single_source',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Create a new provider record
   * Only writes fields that exist in the providers table schema
   */
  private async createProvider(fields: MergedProviderFields, categorySlug: string): Promise<string> {
    // Get category_id from slug
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()

    if (categoryError || !categoryData) {
      throw new Error(`Category '${categorySlug}' not found`)
    }

    // Calculate initial position (will be recalculated)
    const { count } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryData.id)

    const position = (count || 0) + 1

    // Generate default email
    const defaultEmail = `contact@${fields.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`

    // Generate default bio
    const categoryName = categorySlug === 'djs' ? 'DJ' : 
                         categorySlug === 'photographers' ? 'Photographer' : 'Videographer'
    const defaultBio = `Professional ${categoryName} serving ${fields.city || 'New York'}, ${fields.state || 'NY'}`

    // Insert ONLY canonical fields that exist in providers table
    const { data, error } = await supabase
      .from('providers')
      .insert({
        name: fields.name,
        category_id: categoryData.id,
        position,
        rating: fields.rating,
        verified: fields.verified,
        featured: fields.featured,
        country: fields.country,
        location: fields.location,
        city: fields.city,
        state: fields.state,
        zip_code: fields.zip_code,
        latitude: fields.latitude,
        longitude: fields.longitude,
        image_url: fields.image_url || '/api/placeholder/150/150',
        bio: defaultBio,
        short_bio: defaultBio.slice(0, 200),
        email: defaultEmail,
        phone: fields.phone || '',
        website: fields.website,
        price_range: fields.price_range,
        social_proof_count: fields.social_proof_count,
        is_active: true,
        is_direct_provider: true // Default new providers to direct providers (admins can mark directories as false)
      })
      .select('id')
      .single()

    if (error || !data) {
      throw new Error(`Failed to create provider: ${error?.message}`)
    }

    return data.id
  }

  /**
   * Update an existing provider record
   * Preserves view_count, contact_count, claimed state, and manual edits
   * Only updates canonical fields
   */
  private async updateProvider(
    providerId: string,
    fields: MergedProviderFields
  ): Promise<void> {
    // Get existing provider to preserve certain fields
    const { data: existing, error: fetchError } = await supabase
      .from('providers')
      .select('verified')
      .eq('id', providerId)
      .single()

    if (fetchError || !existing) {
      throw new Error(`Provider ${providerId} not found`)
    }

    // Build update object with ONLY canonical fields
    const updateData = {
      name: fields.name,
      rating: fields.rating,
      location: fields.location,
      city: fields.city,
      state: fields.state,
      zip_code: fields.zip_code,
      country: fields.country,
      latitude: fields.latitude,
      longitude: fields.longitude,
      phone: fields.phone,
      website: fields.website,
      image_url: fields.image_url,
      price_range: fields.price_range,
      social_proof_count: fields.social_proof_count,
      verified: fields.verified || existing.verified, // Don't un-verify
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('providers')
      .update(updateData)
      .eq('id', providerId)

    if (error) {
      throw new Error(`Failed to update provider: ${error.message}`)
    }
  }

  /**
   * Link source records to a provider
   */
  private async linkSourcesToProvider(
    providerId: string,
    ...sourceIds: (string | undefined)[]
  ): Promise<void> {
    for (const sourceId of sourceIds) {
      if (!sourceId) continue

      const { error } = await supabase
        .from('provider_sources')
        .update({ provider_id: providerId })
        .eq('id', sourceId)

      if (error) {
        console.error(`[Merge] Failed to link source ${sourceId}:`, error)
      }
    }
  }

  /**
   * Record a match in provider_matches table
   */
  private async recordMatch(
    providerId: string,
    source: ProviderSourceData,
    confidenceScore: number,
    matchType: 'auto' | 'partial' | 'manual' | 'single_source',
    matchedFields: MatchedFieldsBreakdown
  ): Promise<void> {
    // Check if match already exists
    const { data: existing } = await supabase
      .from('provider_matches')
      .select('id')
      .eq('source', source.source)
      .eq('source_provider_id', source.source_provider_id)
      .single()

    const dbMatchType = matchType === 'single_source' ? 'auto' : matchType

    if (existing) {
      // Update existing match
      const { error } = await supabase
        .from('provider_matches')
        .update({
          provider_id: providerId,
          confidence_score: confidenceScore,
          match_type: dbMatchType,
          matched_fields: matchedFields
        })
        .eq('id', existing.id)

      if (error) {
        console.error('[Merge] Failed to update match:', error)
      }
    } else {
      // Insert new match
      const { error } = await supabase
        .from('provider_matches')
        .insert({
          provider_id: providerId,
          source: source.source,
          source_provider_id: source.source_provider_id,
          confidence_score: confidenceScore,
          match_type: dbMatchType,
          matched_fields: matchedFields
        })

      if (error) {
        console.error('[Merge] Failed to insert match:', error)
      }
    }
  }

  // ==========================================================================
  // BATCH OPERATIONS
  // ==========================================================================

  /**
   * Run full match and merge process
   */
  async matchAndMergeProviders(): Promise<MergeAllResult> {
    const result: MergeAllResult = {
      success: true,
      total_processed: 0,
      providers_created: 0,
      providers_updated: 0,
      matches_recorded: 0,
      single_source_created: 0,
      errors: []
    }

    try {
      console.log('[Merge] Starting match and merge process...')

      // Step 1: Run matching
      const matchResult = await matchingService.matchAllProviders()
      console.log(`[Merge] Found ${matchResult.matches.length} matches`)

      // Step 2: Process matched pairs
      for (const match of matchResult.matches) {
        const mergeResult = await this.mergeMatchedSources(match)
        result.total_processed++

        if (mergeResult.success) {
          if (mergeResult.action === 'created') {
            result.providers_created++
          } else if (mergeResult.action === 'updated') {
            result.providers_updated++
          }
          result.matches_recorded += 2 // Two sources per match
        } else {
          result.errors.push({
            source_id: match.source.id,
            error: mergeResult.error || 'Unknown error'
          })
        }
      }

      // Step 3: Process unmatched sources (create single-source providers)
      const { data: unmatchedSources } = await supabase
        .from('provider_sources')
        .select('*')
        .is('provider_id', null)

      console.log(`[Merge] Processing ${unmatchedSources?.length || 0} unmatched sources`)

      for (const source of unmatchedSources || []) {
        const mergeResult = await this.createFromSingleSource(source as ProviderSourceData)
        result.total_processed++

        if (mergeResult.success) {
          result.single_source_created++
          result.matches_recorded++
        } else {
          result.errors.push({
            source_id: source.id,
            error: mergeResult.error || 'Unknown error'
          })
        }
      }

      // Step 4: Rebuild rankings
      await this.rebuildRankings()

      console.log(`[Merge] Completed: ${result.providers_created} created, ${result.providers_updated} updated, ${result.single_source_created} single-source`)

    } catch (error) {
      console.error('[Merge] Fatal error:', error)
      result.success = false
    }

    return result
  }

  /**
   * Rebuild provider rankings based on rating and review count
   */
  async rebuildRankings(): Promise<{ success: boolean; updated: number }> {
    let totalUpdated = 0

    try {
      // Get all categories
      const { data: categories } = await supabase
        .from('categories')
        .select('id, slug')

      for (const category of categories || []) {
        // Get providers for this category, sorted by rating and review count
        const { data: providers } = await supabase
          .from('providers')
          .select('id, rating, social_proof_count')
          .eq('category_id', category.id)
          .eq('is_active', true)
          .order('rating', { ascending: false })
          .order('social_proof_count', { ascending: false })

        // Update positions
        for (let i = 0; i < (providers?.length || 0); i++) {
          const { error } = await supabase
            .from('providers')
            .update({ position: i + 1 })
            .eq('id', providers![i].id)

          if (!error) totalUpdated++
        }
      }

      console.log(`[Merge] Rankings rebuilt: ${totalUpdated} providers updated`)
      return { success: true, updated: totalUpdated }

    } catch (error) {
      console.error('[Merge] Error rebuilding rankings:', error)
      return { success: false, updated: totalUpdated }
    }
  }
}

// Export singleton instance
export const mergeService = new MergeService()
