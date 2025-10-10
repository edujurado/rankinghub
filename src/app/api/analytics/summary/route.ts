import { BetaAnalyticsDataClient } from '@google-analytics/data'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const propertyId = process.env.GA4_PROPERTY_ID
    const clientEmail = process.env.GA_SA_CLIENT_EMAIL
    const privateKey = process.env.GA_SA_PRIVATE_KEY

    if (!propertyId || !clientEmail || !privateKey) {
      throw new Error('GA4 environment variables are not set.')
    }

    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, '\n'), // Handle newlines
      },
    })

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '7daysAgo',
          endDate: 'today',
        },
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'newUsers' },
        { name: 'averageSessionDuration' },
        { name: 'screenPageViews' },
      ],
      dimensions: [
        { name: 'date' },
      ],
    })

    // Process the response
    const rows = response.rows || []
    const totalActiveUsers = rows.reduce((sum, row) => {
      const activeUsers = parseInt(row.metricValues?.[0]?.value || '0')
      return sum + activeUsers
    }, 0)

    const totalNewUsers = rows.reduce((sum, row) => {
      const newUsers = parseInt(row.metricValues?.[1]?.value || '0')
      return sum + newUsers
    }, 0)

    const totalPageViews = rows.reduce((sum, row) => {
      const pageViews = parseInt(row.metricValues?.[3]?.value || '0')
      return sum + pageViews
    }, 0)

    const avgSessionDuration = rows.length > 0 
      ? rows.reduce((sum, row) => {
          const duration = parseFloat(row.metricValues?.[2]?.value || '0')
          return sum + duration
        }, 0) / rows.length
      : 0

    return NextResponse.json({
      success: true,
      data: {
        activeUsers: totalActiveUsers,
        newUsers: totalNewUsers,
        averageSessionDuration: Math.round(avgSessionDuration),
        totalPageViews: totalPageViews,
        period: '7 days',
        lastUpdated: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error fetching GA4 data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}