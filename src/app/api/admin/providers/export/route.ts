import { NextRequest, NextResponse } from 'next/server'
import { getProvidersPaginated } from '@/lib/admin'

/**
 * GET /api/admin/providers/export
 * Exports all providers as CSV
 * Query params:
 *   - search: optional search query to filter providers
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const searchQuery = searchParams.get('search') || undefined
    
    // Fetch all providers (use a large page size to get all)
    let allProviders: any[] = []
    let page = 1
    const pageSize = 1000
    let hasMore = true

    // Fetch all pages
    while (hasMore) {
      const result = await getProvidersPaginated(page, pageSize, searchQuery, 'created_at', 'desc')
      allProviders = [...allProviders, ...result.providers]
      
      if (result.hasNextPage) {
        page++
      } else {
        hasMore = false
      }
    }

    // Convert to CSV
    const headers = [
      'ID',
      'Name',
      'Category',
      'Position',
      'Rating',
      'Verified',
      'Country',
      'Location',
      'City',
      'State',
      'Email',
      'Phone',
      'Website',
      'Instagram',
      'Bio',
      'Image URL',
      'Views',
      'Contacts',
      'Punctuality',
      'Professionalism',
      'Reliability',
      'Price',
      'Client Satisfaction',
      'Is Active',
      'Is Claimed',
      'Created At',
      'Updated At'
    ]

    const csvRows = [
      headers.join(','),
      ...allProviders.map(provider => {
        const escapeCSV = (field: any) => {
          if (field === null || field === undefined) return ''
          const str = String(field)
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return str
        }

        return [
          escapeCSV(provider.id),
          escapeCSV(provider.name),
          escapeCSV(provider.category),
          escapeCSV(provider.position),
          escapeCSV(provider.rating),
          escapeCSV(provider.verified),
          escapeCSV(provider.country),
          escapeCSV(provider.location),
          escapeCSV(provider.city || ''),
          escapeCSV(provider.state || ''),
          escapeCSV(provider.contact?.email || ''),
          escapeCSV(provider.contact?.phone || ''),
          escapeCSV(provider.contact?.website || ''),
          escapeCSV(provider.contact?.instagram || ''),
          escapeCSV(provider.bio?.replace(/\n/g, ' ') || ''),
          escapeCSV(provider.image || ''),
          escapeCSV(provider.view_count || 0),
          escapeCSV(provider.contact_count || 0),
          escapeCSV(provider.skills?.punctuality || 0),
          escapeCSV(provider.skills?.professionalism || 0),
          escapeCSV(provider.skills?.reliability || 0),
          escapeCSV(provider.skills?.price || 0),
          escapeCSV(provider.skills?.clientSatisfaction || 0),
          escapeCSV(provider.is_active !== false),
          escapeCSV(provider.is_claimed || false),
          escapeCSV(provider.created_at || ''),
          escapeCSV(provider.updated_at || '')
        ].join(',')
      })
    ]

    const csvContent = csvRows.join('\n')
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `providers_export_${timestamp}.csv`

    // Return CSV as response
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error exporting providers:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

