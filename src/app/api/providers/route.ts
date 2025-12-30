import { NextRequest, NextResponse } from 'next/server'
import { getProvidersByCategoryPaginated } from '@/lib/database'

/**
 * GET /api/providers
 * Fetches paginated providers by category
 * Query params:
 *   - category: category slug (djs, photographers, videographers)
 *   - search: optional search query
 *   - sortBy: rating | price | popularity (default: rating)
 *   - page: page number (default: 1)
 *   - pageSize: items per page (default: 20)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category') || 'djs'
    const searchQuery = searchParams.get('search') || undefined
    const sortBy = (searchParams.get('sortBy') as 'rating' | 'price' | 'popularity') || 'rating'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10)

    if (page < 1) {
      return NextResponse.json(
        { success: false, error: 'Page must be greater than 0' },
        { status: 400 }
      )
    }

    if (pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        { success: false, error: 'Page size must be between 1 and 100' },
        { status: 400 }
      )
    }

    const result = await getProvidersByCategoryPaginated(
      category,
      searchQuery,
      sortBy,
      page,
      pageSize
    )

    return NextResponse.json({
      success: true,
      data: result.providers,
      pagination: {
        page,
        pageSize,
        total: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage
      }
    })
  } catch (error) {
    console.error('Error fetching providers:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

