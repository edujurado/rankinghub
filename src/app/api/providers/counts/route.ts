import { NextResponse } from 'next/server'
import { getProviderCountsByCategory } from '@/lib/database'

/**
 * GET /api/providers/counts
 * Returns provider counts for all categories
 */
export async function GET() {
  try {
    const counts = await getProviderCountsByCategory()

    return NextResponse.json({
      success: true,
      counts
    })
  } catch (error) {
    console.error('Error fetching provider counts:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

