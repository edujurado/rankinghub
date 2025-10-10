import { BetaAnalyticsDataClient } from '@google-analytics/data'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const propertyId = process.env.GA4_PROPERTY_ID
    const clientEmail = process.env.GA_SA_CLIENT_EMAIL
    const privateKey = process.env.GA_SA_PRIVATE_KEY

    if (!propertyId || !clientEmail || !privateKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        details: {
          propertyId: !!propertyId,
          clientEmail: !!clientEmail,
          privateKey: !!privateKey
        }
      })
    }

    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
    })

    // Test with a simple request
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
      ],
    })

    return NextResponse.json({
      success: true,
      message: 'GA4 connection successful',
      data: {
        propertyId,
        clientEmail,
        hasData: response.rows && response.rows.length > 0,
        rowCount: response.rows?.length || 0
      }
    })
  } catch (error) {
    console.error('GA4 Test Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'GA4 connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
