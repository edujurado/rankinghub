import { NextRequest, NextResponse } from 'next/server'
import { getProvidersPaginated } from '@/lib/admin'

/**
 * GET /api/admin/providers
 * Fetches paginated providers for admin
 * Query params:
 *   - page: page number (default: 1)
 *   - pageSize: items per page (default: 20)
 *   - search: optional search query
 *   - sortBy: field to sort by (default: created_at)
 *   - sortOrder: asc or desc (default: desc)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10)
    const searchQuery = searchParams.get('search') || undefined
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'

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

    const result = await getProvidersPaginated(page, pageSize, searchQuery, sortBy, sortOrder)

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
    console.error('Error fetching admin providers:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

