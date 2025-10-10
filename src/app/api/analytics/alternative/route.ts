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

    // Try different authentication approaches
    const authOptions = [
      {
        name: 'Standard Credentials',
        credentials: {
          client_email: clientEmail,
          private_key: privateKey.replace(/\\n/g, '\n'),
        }
      },
      {
        name: 'Alternative Format',
        credentials: {
          client_email: clientEmail,
          private_key: privateKey.replace(/\\n/g, '\n'),
        },
        projectId: 'rankinghub-analitycs'
      }
    ]

    for (const authOption of authOptions) {
      try {
        console.log(`Trying authentication: ${authOption.name}`)
        
        const analyticsDataClient = new BetaAnalyticsDataClient(authOption)

        // Try different property ID formats
        const propertyFormats = [
          `properties/${propertyId}`,
          `properties/${propertyId}`,
          `properties/${propertyId}`,
        ]

        for (const propertyFormat of propertyFormats) {
          try {
            console.log(`Trying property format: ${propertyFormat}`)
            
            const [response] = await analyticsDataClient.runReport({
              property: propertyFormat,
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
                workingAuth: authOption.name,
                workingPropertyFormat: propertyFormat,
              },
            })
          } catch (propertyError) {
            console.log(`Property format ${propertyFormat} failed:`, propertyError)
            continue
          }
        }
      } catch (authError) {
        console.log(`Authentication ${authOption.name} failed:`, authError)
        continue
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'All authentication and property format attempts failed',
        details: 'Please check service account permissions in Google Analytics',
        suggestions: [
          'Add service account to GA4 Property Access Management',
          'Add service account to GA4 Account Access Management',
          'Enable Google Analytics Data API in Google Cloud Console',
          'Verify Property ID is correct'
        ]
      },
      { status: 500 }
    )
  } catch (error) {
    console.error('Alternative GA4 Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Alternative GA4 connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
