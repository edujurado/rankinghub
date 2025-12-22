import { NextRequest, NextResponse } from 'next/server'
import { syncService } from '@/lib/api/sync-service'
import { getCurrentUser } from '@/lib/auth'

/**
 * POST /api/sync
 * Manual sync endpoint for admin use
 * 
 * Supports:
 * - Full sync (all categories)
 * - Category-specific sync
 * - Single provider sync
 * - Ingestion-only mode
 * - Match-and-merge only mode
 * 
 * Requires admin authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    // const user = await getCurrentUser()
    // if (!user || user.role !== 'admin') {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   )
    // }

    const body = await request.json()
    const {
      mode,           // 'full' | 'ingestion' | 'match' | 'single'
      categories,     // Optional: specific categories to sync
      location,       // Optional: location to search (default: 'New York, NY')
      limit,          // Optional: max results per category (default: 50)
      name,           // Required for single provider sync
      category        // Required for single provider sync
    } = body

    // Single provider sync
    if (mode === 'single' && name && category) {
      const result = await syncService.syncSingleProvider(
        name,
        category,
        location || 'New York, NY'
      )
      return NextResponse.json(result)
    }

    // Ingestion only
    if (mode === 'ingestion') {
      const result = await syncService.runIngestionOnly({
        categories,
        location: location || 'New York, NY',
        limit: limit || 50
      })
      return NextResponse.json({
        success: result.success,
        mode: 'ingestion',
        yelp_total: result.yelp.reduce((sum, r) => sum + r.total, 0),
        google_total: result.google.reduce((sum, r) => sum + r.total, 0),
        errors: result.errors
      })
    }

    // Match and merge only
    if (mode === 'match') {
      const result = await syncService.runMatchAndMerge()
      return NextResponse.json({
        success: result.success,
        mode: 'match',
        providers_created: result.providers_created,
        providers_updated: result.providers_updated,
        single_source_created: result.single_source_created,
        matches_recorded: result.matches_recorded,
        errors: result.errors
      })
    }

    // Full sync (default)
    const result = await syncService.runFullSync({
      categories,
      location: location || 'New York, NY',
      limit: limit || 50
    })

    return NextResponse.json({
      success: result.success,
      mode: 'full',
      duration_ms: result.duration_ms,
      timestamp: result.timestamp,
      ingestion: result.ingestion ? {
        yelp_total: result.ingestion.yelp.reduce((sum, r) => sum + r.total, 0),
        google_total: result.ingestion.google.reduce((sum, r) => sum + r.total, 0)
      } : null,
      matching: result.matching ? {
        auto_matches: result.matching.auto_matches,
        partial_matches: result.matching.partial_matches
      } : null,
      merge: result.merge ? {
        providers_created: result.merge.providers_created,
        providers_updated: result.merge.providers_updated
      } : null,
      errors: result.errors.length > 0 ? result.errors : undefined
    })

  } catch (error) {
    console.error('Error in sync endpoint:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/sync
 * Get sync statistics
 * Requires admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const stats = await syncService.getSyncStats()
    const recentSyncs = await syncService.getRecentSyncs(10)
    const syncNeeded = await syncService.isSyncNeeded(24)

    return NextResponse.json({
      success: true,
      stats,
      recent_syncs: recentSyncs,
      sync_needed: syncNeeded,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error getting sync stats:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
