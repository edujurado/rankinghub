import { NextRequest, NextResponse } from 'next/server'
import { matchingService } from '@/lib/api/matching-service'
import { mergeService } from '@/lib/api/merge-service'

/**
 * POST /api/cron/match-providers
 * On-demand provider matching and merging
 * 
 * Use this endpoint to:
 * - Re-run matching after manual data corrections
 * - Process newly ingested sources without full sync
 * - Debug matching issues for specific categories
 * 
 * Protected by CRON_SECRET header
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔗 Starting provider matching job...')

    // Parse optional parameters
    let category: string | undefined
    let skipMerge = false
    let rebuildRankings = true

    try {
      const body = await request.json()
      category = body.category
      skipMerge = body.skipMerge || false
      rebuildRankings = body.rebuildRankings !== false
    } catch {
      // No body provided, use defaults
    }

    // Run matching
    let matchResult
    if (category) {
      console.log(`[Match] Running matching for category: ${category}`)
      matchResult = await matchingService.matchProvidersByCategory(category)
    } else {
      console.log('[Match] Running matching for all categories')
      matchResult = await matchingService.matchAllProviders()
    }

    console.log(`[Match] Found ${matchResult.matches.length} matches`)
    console.log(`[Match] Auto: ${matchResult.auto_matches}, Partial: ${matchResult.partial_matches}, None: ${matchResult.no_matches}`)

    // Run merge if not skipped
    let mergeResult = null
    if (!skipMerge) {
      console.log('[Match] Running merge...')
      mergeResult = await mergeService.matchAndMergeProviders()
      console.log(`[Match] Merge complete: ${mergeResult.providers_created} created, ${mergeResult.providers_updated} updated`)
    }

    // Rebuild rankings if requested
    let rankingsResult = null
    if (rebuildRankings && !skipMerge) {
      console.log('[Match] Rebuilding rankings...')
      rankingsResult = await mergeService.rebuildRankings()
      console.log(`[Match] Rankings rebuilt: ${rankingsResult.updated} providers`)
    }

    const duration = Date.now() - startTime

    return NextResponse.json({
      success: matchResult.success,
      duration_ms: duration,
      timestamp: new Date().toISOString(),
      matching: {
        total_matches: matchResult.matches.length,
        auto_matches: matchResult.auto_matches,
        partial_matches: matchResult.partial_matches,
        no_matches: matchResult.no_matches,
        unmatched_yelp: matchResult.unmatched_yelp,
        unmatched_google: matchResult.unmatched_google
      },
      merge: mergeResult ? {
        providers_created: mergeResult.providers_created,
        providers_updated: mergeResult.providers_updated,
        single_source_created: mergeResult.single_source_created,
        matches_recorded: mergeResult.matches_recorded,
        errors: mergeResult.errors.length
      } : null,
      rankings: rankingsResult ? {
        updated: rankingsResult.updated
      } : null
    })

  } catch (error) {
    console.error('❌ Error in match-providers job:', error)
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
 * GET /api/cron/match-providers
 * Get matching statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const stats = await matchingService.getMatchingStats()

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error getting matching stats:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

