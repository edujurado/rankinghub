import { NextRequest, NextResponse } from 'next/server'
import { syncService } from '@/lib/api/sync-service'
import { getCurrentUser } from '@/lib/auth'

/**
 * POST /api/sync/rebuild-rankings
 * Rebuild rankings based on RH-Score
 * Requires admin authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { category } = body

    const result = await syncService.rebuildRankings(category)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error rebuilding rankings:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

