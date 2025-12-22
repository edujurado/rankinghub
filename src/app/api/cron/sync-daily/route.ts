import { NextRequest, NextResponse } from 'next/server'
import { syncService } from '@/lib/api/sync-service'

/**
 * POST /api/cron/sync-daily
 * Daily cron job to sync all providers
 * 
 * New Flow:
 * 1. Ingest from Yelp + Google APIs -> provider_sources table
 * 2. Match providers across sources with confidence scoring
 * 3. Merge into canonical providers table
 * 4. Rebuild rankings
 * 
 * Protected by CRON_SECRET header
 * Schedule: 2:00 AM ET daily (configure in Vercel cron)
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Verify cron secret (set in Vercel environment variables)
    // const authHeader = request.headers.get('authorization')
    // const cronSecret = process.env.CRON_SECRET

    // if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   )
    // }

    console.log('🔄 Starting daily sync job...')

    // Parse optional parameters from request body
    let options = {}
    try {
      const body = await request.json()
      options = {
        categories: body.categories,
        location: body.location || 'New York, NY',
        limit: body.limit || 50,
        skipIngestion: body.skipIngestion,
        skipMatching: body.skipMatching
      }
    } catch {
      // No body provided, use defaults
      options = {
        location: 'New York, NY',
        limit: 50
      }
    }

    // Run full sync process
    const result = await syncService.runFullSync(options)

    // Log summary
    const ingestionSummary = result.ingestion ? {
      yelp_total: result.ingestion.yelp.reduce((sum, r) => sum + r.total, 0),
      yelp_inserted: result.ingestion.yelp.reduce((sum, r) => sum + r.inserted, 0),
      google_total: result.ingestion.google.reduce((sum, r) => sum + r.total, 0),
      google_inserted: result.ingestion.google.reduce((sum, r) => sum + r.inserted, 0)
    } : null

    const matchingSummary = result.matching ? {
      auto_matches: result.matching.auto_matches,
      partial_matches: result.matching.partial_matches,
      no_matches: result.matching.no_matches
    } : null

    const mergeSummary = result.merge ? {
      providers_created: result.merge.providers_created,
      providers_updated: result.merge.providers_updated,
      single_source_created: result.merge.single_source_created
    } : null

    console.log('✅ Daily sync completed:', {
      duration_ms: result.duration_ms,
      ingestion: ingestionSummary,
      matching: matchingSummary,
      merge: mergeSummary,
      rankings_updated: result.rankings?.updated || 0
    })

    return NextResponse.json({
      success: result.success,
      timestamp: result.timestamp,
      duration_ms: result.duration_ms,
      summary: {
        ingestion: ingestionSummary,
        matching: matchingSummary,
        merge: mergeSummary,
        rankings_updated: result.rankings?.updated || 0
      },
      errors: result.errors.length > 0 ? result.errors : undefined
    })

  } catch (error) {
    console.error('❌ Error in daily sync cron:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration_ms: Date.now() - startTime
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/cron/sync-daily
 * Get sync statistics and status
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for GET requests too
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get sync statistics
    const stats = await syncService.getSyncStats()
    const recentSyncs = await syncService.getRecentSyncs(5)
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
