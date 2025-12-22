/**
 * Matching Service
 * Implements provider entity matching between Yelp and Google Places sources
 * Uses confidence scoring to determine match quality
 */

import { supabase } from '../supabase'

// ============================================================================
// TYPES
// ============================================================================

export interface ProviderSourceData {
  id: string
  source: 'yelp' | 'google'
  source_provider_id: string
  provider_id: string | null
  category_slug: string
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
  // Yelp-specific
  yelp_alias?: string | null
  yelp_url?: string | null
  yelp_display_phone?: string | null
  yelp_is_closed?: boolean | null
  yelp_transactions?: string[] | null
  yelp_distance?: number | null
  yelp_business_hours?: Record<string, unknown> | null
  yelp_attributes?: Record<string, unknown> | null
  yelp_image_url?: string | null
  // Google-specific
  google_formatted_address?: string | null
  google_types?: string[] | null
  google_international_phone?: string | null
  google_photos?: Record<string, unknown>[] | null
  google_viewport?: Record<string, unknown> | null
  google_html_attributions?: string[] | null
  // Raw data
  raw_data: Record<string, unknown>
}

export interface MatchCandidate {
  source: ProviderSourceData
  candidate: ProviderSourceData
  confidence_score: number
  match_type: 'auto' | 'partial' | 'none'
  matched_fields: MatchedFieldsBreakdown
}

export interface MatchedFieldsBreakdown {
  name_score: number
  phone_match: boolean
  phone_score: number
  address_score: number
  website_match: boolean
  website_score: number
  geo_distance_meters: number | null
  geo_score: number
  total_score: number
}

export interface MatchResult {
  success: boolean
  matches: MatchCandidate[]
  unmatched_yelp: number
  unmatched_google: number
  auto_matches: number
  partial_matches: number
  no_matches: number
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Confidence score weights
const WEIGHTS = {
  NAME: 0.35,
  PHONE: 0.25,
  ADDRESS: 0.20,
  WEBSITE: 0.10,
  GEO: 0.10
} as const

// Thresholds
const THRESHOLDS = {
  AUTO_MERGE: 0.85,
  PARTIAL_MERGE: 0.65,
  MAX_DISTANCE_METERS: 500
} as const

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate Haversine distance between two coordinates (in meters)
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000 // Earth's radius in meters
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string | null): string | null {
  if (!url) return null
  try {
    const cleanUrl = url.toLowerCase()
      .replace(/^https?:\/\/(www\.)?/, '')
      .replace(/\/.*$/, '')
    return cleanUrl || null
  } catch {
    return null
  }
}

/**
 * Normalize name for comparison (lowercase, remove special chars)
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Calculate trigram similarity between two strings (0-1)
 * This is a JavaScript approximation of pg_trgm similarity
 */
function trigramSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0

  const s1 = normalizeName(str1)
  const s2 = normalizeName(str2)

  if (s1 === s2) return 1
  if (s1.length < 3 || s2.length < 3) {
    // For short strings, use simpler comparison
    return s1 === s2 ? 1 : s1.includes(s2) || s2.includes(s1) ? 0.8 : 0
  }

  // Generate trigrams
  const trigrams1:any = new Set<string>()
  const trigrams2:any = new Set<string>()

  for (let i = 0; i <= s1.length - 3; i++) {
    trigrams1.add(s1.substring(i, i + 3))
  }
  for (let i = 0; i <= s2.length - 3; i++) {
    trigrams2.add(s2.substring(i, i + 3))
  }

  // Calculate Jaccard similarity
  let intersection = 0
  for (const trigram of trigrams1) {
    if (trigrams2.has(trigram)) intersection++
  }

  const union = trigrams1.size + trigrams2.size - intersection
  return union === 0 ? 0 : intersection / union
}

// ============================================================================
// MATCHING SERVICE CLASS
// ============================================================================

export class MatchingService {
  // ==========================================================================
  // CONFIDENCE SCORING
  // ==========================================================================

  /**
   * Calculate confidence score between two provider sources
   */
  calculateConfidenceScore(
    source1: ProviderSourceData,
    source2: ProviderSourceData
  ): MatchedFieldsBreakdown {
    // Name similarity (using trigram)
    const nameScore = trigramSimilarity(source1.name, source2.name)

    // Phone match (normalized exact match)
    const phoneMatch = !!(
      source1.phone_normalized &&
      source2.phone_normalized &&
      source1.phone_normalized === source2.phone_normalized
    )
    const phoneScore = phoneMatch ? 1 : 0

    // Address similarity (using trigram)
    const addressScore = trigramSimilarity(
      source1.address || '',
      source2.address || ''
    )

    // Website domain match
    const domain1 = extractDomain(source1.website)
    const domain2 = extractDomain(source2.website)
    const websiteMatch = !!(domain1 && domain2 && domain1 === domain2)
    const websiteScore = websiteMatch ? 1 : 0

    // Geo distance score
    let geoDistanceMeters: number | null = null
    let geoScore = 0

    if (
      source1.latitude != null &&
      source1.longitude != null &&
      source2.latitude != null &&
      source2.longitude != null
    ) {
      geoDistanceMeters = haversineDistance(
        source1.latitude,
        source1.longitude,
        source2.latitude,
        source2.longitude
      )

      // Convert distance to score (0-1)
      // 0 meters = 1.0, 500+ meters = 0
      if (geoDistanceMeters <= THRESHOLDS.MAX_DISTANCE_METERS) {
        geoScore = 1 - (geoDistanceMeters / THRESHOLDS.MAX_DISTANCE_METERS)
      }
    }

    // Calculate weighted total score
    const totalScore =
      (nameScore * WEIGHTS.NAME) +
      (phoneScore * WEIGHTS.PHONE) +
      (addressScore * WEIGHTS.ADDRESS) +
      (websiteScore * WEIGHTS.WEBSITE) +
      (geoScore * WEIGHTS.GEO)

    return {
      name_score: Math.round(nameScore * 10000) / 10000,
      phone_match: phoneMatch,
      phone_score: phoneScore,
      address_score: Math.round(addressScore * 10000) / 10000,
      website_match: websiteMatch,
      website_score: websiteScore,
      geo_distance_meters: geoDistanceMeters ? Math.round(geoDistanceMeters) : null,
      geo_score: Math.round(geoScore * 10000) / 10000,
      total_score: Math.round(totalScore * 10000) / 10000
    }
  }

  /**
   * Determine match type based on confidence score
   */
  getMatchType(confidenceScore: number): 'auto' | 'partial' | 'none' {
    if (confidenceScore >= THRESHOLDS.AUTO_MERGE) return 'auto'
    if (confidenceScore >= THRESHOLDS.PARTIAL_MERGE) return 'partial'
    return 'none'
  }

  // ==========================================================================
  // CANDIDATE SELECTION
  // ==========================================================================

  /**
   * Find matching candidates for a source record
   * Filters by:
   * - Opposite source (Yelp ↔ Google)
   * - Same category
   * - Distance <= 500 meters (if coordinates available)
   */
  async findCandidates(
    source: ProviderSourceData
  ): Promise<ProviderSourceData[]> {
    const oppositeSource = source.source === 'yelp' ? 'google' : 'yelp'

    // Build query for candidates
    let query = supabase
      .from('provider_sources')
      .select('*')
      .eq('source', oppositeSource)
      .eq('category_slug', source.category_slug)
      .is('provider_id', null) // Only unlinked sources

    const { data: candidates, error } = await query

    if (error) {
      console.error('[Matching] Error fetching candidates:', error)
      return []
    }

    if (!candidates || candidates.length === 0) {
      return []
    }

    // Filter by distance if coordinates are available
    const filteredCandidates: ProviderSourceData[] = []

    for (const candidate of candidates) {
      // If source has coordinates, filter by distance
      if (
        source.latitude != null &&
        source.longitude != null &&
        candidate.latitude != null &&
        candidate.longitude != null
      ) {
        const distance = haversineDistance(
          source.latitude,
          source.longitude,
          candidate.latitude,
          candidate.longitude
        )

        if (distance <= THRESHOLDS.MAX_DISTANCE_METERS) {
          filteredCandidates.push(candidate as ProviderSourceData)
        }
      } else {
        // If no coordinates, include candidate for name-based matching
        filteredCandidates.push(candidate as ProviderSourceData)
      }
    }

    return filteredCandidates
  }

  // ==========================================================================
  // MAIN MATCHING LOGIC
  // ==========================================================================

  /**
   * Find the best match for a source record
   */
  async findBestMatch(
    source: ProviderSourceData
  ): Promise<MatchCandidate | null> {
    const candidates = await this.findCandidates(source)

    if (candidates.length === 0) {
      return null
    }

    let bestMatch: MatchCandidate | null = null

    for (const candidate of candidates) {
      const matchedFields = this.calculateConfidenceScore(source, candidate)
      const matchType = this.getMatchType(matchedFields.total_score)

      const match: MatchCandidate = {
        source,
        candidate,
        confidence_score: matchedFields.total_score,
        match_type: matchType,
        matched_fields: matchedFields
      }

      // Keep track of best match
      if (!bestMatch || match.confidence_score > bestMatch.confidence_score) {
        bestMatch = match
      }
    }

    // Only return if match meets minimum threshold
    if (bestMatch && bestMatch.match_type !== 'none') {
      return bestMatch
    }

    return null
  }

  /**
   * Run matching for all unlinked provider sources
   */
  async matchAllProviders(): Promise<MatchResult> {
    const result: MatchResult = {
      success: true,
      matches: [],
      unmatched_yelp: 0,
      unmatched_google: 0,
      auto_matches: 0,
      partial_matches: 0,
      no_matches: 0
    }

    try {
      // Get all unlinked Yelp sources (we'll match Yelp -> Google)
      const { data: yelpSources, error: yelpError } = await supabase
        .from('provider_sources')
        .select('*')
        .eq('source', 'yelp')
        .is('provider_id', null)

      if (yelpError) {
        throw new Error(`Error fetching Yelp sources: ${yelpError.message}`)
      }

      console.log(`[Matching] Processing ${yelpSources?.length || 0} unlinked Yelp sources`)

      // Track matched Google sources to avoid double-matching
      const matchedGoogleIds = new Set<string>()

      // Process each Yelp source
      for (const yelpSource of yelpSources || []) {
        const bestMatch = await this.findBestMatch(yelpSource as ProviderSourceData)

        if (bestMatch && !matchedGoogleIds.has(bestMatch.candidate.id)) {
          result.matches.push(bestMatch)
          matchedGoogleIds.add(bestMatch.candidate.id)

          if (bestMatch.match_type === 'auto') {
            result.auto_matches++
          } else if (bestMatch.match_type === 'partial') {
            result.partial_matches++
          }
        } else {
          result.no_matches++
          result.unmatched_yelp++
        }
      }

      // Count unmatched Google sources
      const { count: googleUnmatched } = await supabase
        .from('provider_sources')
        .select('*', { count: 'exact', head: true })
        .eq('source', 'google')
        .is('provider_id', null)

      result.unmatched_google = (googleUnmatched || 0) - matchedGoogleIds.size

      console.log(`[Matching] Results: ${result.auto_matches} auto, ${result.partial_matches} partial, ${result.no_matches} no match`)

    } catch (error) {
      console.error('[Matching] Error:', error)
      result.success = false
    }

    return result
  }

  /**
   * Match providers for a specific category
   */
  async matchProvidersByCategory(categorySlug: string): Promise<MatchResult> {
    const result: MatchResult = {
      success: true,
      matches: [],
      unmatched_yelp: 0,
      unmatched_google: 0,
      auto_matches: 0,
      partial_matches: 0,
      no_matches: 0
    }

    try {
      // Get unlinked Yelp sources for this category
      const { data: yelpSources, error: yelpError } = await supabase
        .from('provider_sources')
        .select('*')
        .eq('source', 'yelp')
        .eq('category_slug', categorySlug)
        .is('provider_id', null)

      if (yelpError) {
        throw new Error(`Error fetching Yelp sources: ${yelpError.message}`)
      }

      console.log(`[Matching] Processing ${yelpSources?.length || 0} unlinked Yelp sources for ${categorySlug}`)

      const matchedGoogleIds = new Set<string>()

      for (const yelpSource of yelpSources || []) {
        const bestMatch = await this.findBestMatch(yelpSource as ProviderSourceData)

        if (bestMatch && !matchedGoogleIds.has(bestMatch.candidate.id)) {
          result.matches.push(bestMatch)
          matchedGoogleIds.add(bestMatch.candidate.id)

          if (bestMatch.match_type === 'auto') {
            result.auto_matches++
          } else if (bestMatch.match_type === 'partial') {
            result.partial_matches++
          }
        } else {
          result.no_matches++
          result.unmatched_yelp++
        }
      }

      // Count unmatched Google sources for this category
      const { count: googleUnmatched } = await supabase
        .from('provider_sources')
        .select('*', { count: 'exact', head: true })
        .eq('source', 'google')
        .eq('category_slug', categorySlug)
        .is('provider_id', null)

      result.unmatched_google = (googleUnmatched || 0) - matchedGoogleIds.size

    } catch (error) {
      console.error('[Matching] Error:', error)
      result.success = false
    }

    return result
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  /**
   * Get matching statistics
   */
  async getMatchingStats(): Promise<{
    total_sources: number
    linked_sources: number
    unlinked_sources: number
    total_matches: number
    auto_matches: number
    partial_matches: number
    manual_matches: number
  }> {
    // Count sources
    const { count: totalSources } = await supabase
      .from('provider_sources')
      .select('*', { count: 'exact', head: true })

    const { count: linkedSources } = await supabase
      .from('provider_sources')
      .select('*', { count: 'exact', head: true })
      .not('provider_id', 'is', null)

    // Count matches by type
    const { data: matchCounts } = await supabase
      .from('provider_matches')
      .select('match_type')

    const matchStats = {
      auto: 0,
      partial: 0,
      manual: 0
    }

    for (const match of matchCounts || []) {
      if (match.match_type === 'auto') matchStats.auto++
      else if (match.match_type === 'partial') matchStats.partial++
      else if (match.match_type === 'manual') matchStats.manual++
    }

    return {
      total_sources: totalSources || 0,
      linked_sources: linkedSources || 0,
      unlinked_sources: (totalSources || 0) - (linkedSources || 0),
      total_matches: (matchCounts || []).length,
      auto_matches: matchStats.auto,
      partial_matches: matchStats.partial,
      manual_matches: matchStats.manual
    }
  }
}

// Export singleton instance
export const matchingService = new MatchingService()

