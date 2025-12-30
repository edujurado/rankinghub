/**
 * Sync Service
 * Orchestrates the complete sync process:
 * 1. Ingestion: Fetch from Yelp and Google APIs -> provider_sources
 * 2. Matching: Find matching providers across sources
 * 3. Merging: Create/update canonical providers table
 * 
 * IMPORTANT: Never writes directly to providers during ingestion
 * All provider data is constructed via match & merge logic
 */

import { ingestionService, IngestionResult } from './ingestion-service'
import { matchingService, MatchResult } from './matching-service'
import { mergeService, MergeAllResult } from './merge-service'
import { supabase } from '../supabase'

// ============================================================================
// TYPES
// ============================================================================

export interface SyncOptions {
  skipIngestion?: boolean
  skipMatching?: boolean
  categories?: string[]
  location?: string
  limit?: number
}

export interface SyncResult {
  success: boolean
  ingestion?: {
    yelp: IngestionResult[]
    google: IngestionResult[]
  }
  matching?: MatchResult
  merge?: MergeAllResult
  rankings?: { success: boolean; updated: number }
  duration_ms: number
  timestamp: string
  errors: string[]
}

export interface SingleProviderSyncResult {
  success: boolean
  providerId?: string
  source?: 'yelp' | 'google' | 'both'
  error?: string
}

// ============================================================================
// SYNC SERVICE CLASS
// ============================================================================

export class SyncService {
  // ==========================================================================
  // MAIN SYNC OPERATIONS
  // ==========================================================================

  /**
   * Run complete sync process:
   * 1. Ingest from Yelp + Google -> provider_sources
   * 2. Match providers across sources
   * 3. Merge into canonical providers table
   * 4. Rebuild rankings
   */
  async runFullSync(options: SyncOptions = {}): Promise<SyncResult> {
    const startTime = Date.now()
    const result: SyncResult = {
      success: true,
      duration_ms: 0,
      timestamp: new Date().toISOString(),
      errors: []
    }

    try {
      const location = options.location || 'New York, NY'
      const limit = options.limit || 50
      const categories = options.categories || ['djs', 'photographers', 'videographers']

      console.log(`[Sync] Starting full sync for ${categories.join(', ')} in ${location}`)

      // Step 1: Ingestion (unless skipped)
      if (!options.skipIngestion) {
        console.log('[Sync] Step 1: Running ingestion...')
        result.ingestion = {
          yelp: [],
          google: []
        }

        for (const category of categories) {
          // Yelp ingestion
          const yelpResult = await ingestionService.fetchYelpProviders(category, location, limit)
          result.ingestion.yelp.push(yelpResult)
          
          if (!yelpResult.success) {
            result.errors.push(`Yelp ingestion failed for ${category}: ${yelpResult.errors[0]?.error}`)
          }

          // Rate limit delay
          await this.delay(200)

          // Google ingestion
          const googleResult = await ingestionService.fetchGoogleProviders(category, location, limit)
          result.ingestion.google.push(googleResult)
          
          if (!googleResult.success) {
            result.errors.push(`Google ingestion failed for ${category}: ${googleResult.errors[0]?.error}`)
      }

          // Delay between categories
          await this.delay(500)
        }

        const totalYelp = result.ingestion.yelp.reduce((sum, r) => sum + r.total, 0)
        const totalGoogle = result.ingestion.google.reduce((sum, r) => sum + r.total, 0)
        console.log(`[Sync] Ingestion complete: ${totalYelp} Yelp, ${totalGoogle} Google records`)
      }

      // Step 2: Matching (unless skipped)
      if (!options.skipMatching) {
        console.log('[Sync] Step 2: Running matching...')
        result.matching = await matchingService.matchAllProviders()
        console.log(`[Sync] Matching complete: ${result.matching.auto_matches} auto, ${result.matching.partial_matches} partial`)
      }

      // Step 3: Merging
      console.log('[Sync] Step 3: Running merge...')
      result.merge = await mergeService.matchAndMergeProviders()
      console.log(`[Sync] Merge complete: ${result.merge.providers_created} created, ${result.merge.providers_updated} updated`)

      // Step 4: Rebuild rankings
      console.log('[Sync] Step 4: Rebuilding rankings...')
      result.rankings = await mergeService.rebuildRankings()
      console.log(`[Sync] Rankings rebuilt: ${result.rankings.updated} providers`)

      // Check for overall success
      result.success = result.errors.length === 0

    } catch (error) {
      console.error('[Sync] Fatal error:', error)
      result.success = false
      result.errors.push(error instanceof Error ? error.message : 'Unknown error')
    }

    result.duration_ms = Date.now() - startTime
    console.log(`[Sync] Full sync completed in ${result.duration_ms}ms`)

    return result
  }

  /**
   * Run ingestion only (no matching or merging)
   */
  async runIngestionOnly(options: SyncOptions = {}): Promise<{
    success: boolean
    yelp: IngestionResult[]
    google: IngestionResult[]
    errors: string[]
  }> {
    const result = {
      success: true,
      yelp: [] as IngestionResult[],
      google: [] as IngestionResult[],
      errors: [] as string[]
    }

    try {
      const location = options.location || 'New York, NY'
      const limit = options.limit || 50
      const categories = options.categories || ['djs', 'photographers', 'videographers']

      for (const category of categories) {
        const yelpResult = await ingestionService.fetchYelpProviders(category, location, limit)
        result.yelp.push(yelpResult)

        await this.delay(200)

        const googleResult = await ingestionService.fetchGoogleProviders(category, location, limit)
        result.google.push(googleResult)

        await this.delay(500)
      }

    } catch (error) {
      result.success = false
      result.errors.push(error instanceof Error ? error.message : 'Unknown error')
    }

    return result
  }

  /**
   * Run matching and merging only (assumes ingestion already done)
   */
  async runMatchAndMerge(): Promise<MergeAllResult> {
    return mergeService.matchAndMergeProviders()
      }

  /**
   * Rebuild rankings only
   */
  async rebuildRankings(category?: string): Promise<{ success: boolean; updated: number }> {
    return mergeService.rebuildRankings()
  }

  // ==========================================================================
  // SINGLE PROVIDER OPERATIONS
  // ==========================================================================

  /**
   * Sync a single provider by name
   * Searches both Yelp and Google, ingests results, then matches and merges
   */
  async syncSingleProvider(
    name: string,
    category: string,
    location: string = 'New York, NY'
  ): Promise<SingleProviderSyncResult> {
    try {
      console.log(`[Sync] Syncing single provider: ${name} (${category}) in ${location}`)

      // Search and ingest from both sources
      const yelpResult = await ingestionService.fetchYelpProviders(category, location, 1)
      await this.delay(200)
      const googleResult = await ingestionService.fetchGoogleProviders(category, location, 1)

      let source: 'yelp' | 'google' | 'both' = 'both'
      if (yelpResult.total === 0 && googleResult.total === 0) {
        return {
          success: false,
          error: 'Provider not found in Yelp or Google'
        }
      } else if (yelpResult.total === 0) {
        source = 'google'
      } else if (googleResult.total === 0) {
        source = 'yelp'
      }

      // Run match and merge for this category
      const mergeResult = await mergeService.matchAndMergeProviders()

      // Find the provider we just synced
      const { data: provider } = await supabase
        .from('providers')
        .select('id')
        .ilike('name', `%${name}%`)
        .single()

      return {
        success: true,
        providerId: provider?.id,
        source
      }

    } catch (error) {
      console.error('[Sync] Error syncing single provider:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // ==========================================================================
  // STATISTICS AND MONITORING
  // ==========================================================================

  /**
   * Get sync statistics
   */
  async getSyncStats(): Promise<{
    provider_sources: {
      total: number
      yelp: number
      google: number
      linked: number
      unlinked: number
    }
    provider_matches: {
      total: number
      auto: number
      partial: number
      manual: number
    }
    providers: {
      total: number
      verified: number
      synced: number
      partial: number
      pending: number
    }
  }> {
    // Provider sources stats
    const { data: sources } = await supabase
      .from('provider_sources')
      .select('source, provider_id')

    const sourceStats = {
      total: sources?.length || 0,
      yelp: 0,
      google: 0,
      linked: 0,
      unlinked: 0
    }

    for (const source of sources || []) {
      if (source.source === 'yelp') sourceStats.yelp++
      if (source.source === 'google') sourceStats.google++
      if (source.provider_id) sourceStats.linked++
      else sourceStats.unlinked++
    }

    // Provider matches stats
    const { data: matches } = await supabase
      .from('provider_matches')
      .select('match_type')

    const matchStats = {
      total: matches?.length || 0,
      auto: 0,
      partial: 0,
      manual: 0
    }

    for (const match of matches || []) {
      if (match.match_type === 'auto') matchStats.auto++
      else if (match.match_type === 'partial') matchStats.partial++
      else if (match.match_type === 'manual') matchStats.manual++
    }

    // Provider stats
    const { data: providers } = await supabase
        .from('providers')
      .select('verified, api_sync_status')
      .eq('is_active', true)

    const providerStats = {
      total: providers?.length || 0,
      verified: 0,
      synced: 0,
      partial: 0,
      pending: 0
    }

    for (const provider of providers || []) {
      if (provider.verified) providerStats.verified++
      if (provider.api_sync_status === 'synced') providerStats.synced++
      else if (provider.api_sync_status === 'partial') providerStats.partial++
      else providerStats.pending++
      }

    return {
      provider_sources: sourceStats,
      provider_matches: matchStats,
      providers: providerStats
    }
  }

  /**
   * Get recent sync history from provider_sources
   */
  async getRecentSyncs(limit: number = 10): Promise<Array<{
    source: string
    category: string
    fetched_at: string
    count: number
  }>> {
    const { data } = await supabase
      .from('provider_sources')
      .select('source, category_slug, fetched_at')
      .order('fetched_at', { ascending: false })
      .limit(limit * 10) // Get more records to group

    if (!data) return []

    // Group by source, category, and date
    const grouped: Record<string, { source: string; category: string; fetched_at: string; count: number }> = {}

    for (const record of data) {
      const date = new Date(record.fetched_at).toISOString().split('T')[0]
      const key = `${record.source}-${record.category_slug}-${date}`
      
      if (!grouped[key]) {
        grouped[key] = {
          source: record.source,
          category: record.category_slug,
          fetched_at: record.fetched_at,
          count: 0
        }
      }
      grouped[key].count++
    }

    return Object.values(grouped)
      .sort((a, b) => new Date(b.fetched_at).getTime() - new Date(a.fetched_at).getTime())
      .slice(0, limit)
      }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Delay helper for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Check if sync is needed (based on last sync time)
   */
  async isSyncNeeded(maxAgeHours: number = 24): Promise<boolean> {
    const { data } = await supabase
      .from('provider_sources')
      .select('fetched_at')
      .order('fetched_at', { ascending: false })
      .limit(1)
      .single()

    if (!data) return true

    const lastFetched = new Date(data.fetched_at)
    const ageMs = Date.now() - lastFetched.getTime()
    const ageHours = ageMs / (1000 * 60 * 60)

    return ageHours > maxAgeHours
  }
}

// Export singleton instance
export const syncService = new SyncService()
