import { BetaAnalyticsDataClient } from '@google-analytics/data'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const propertyId = process.env.GA4_PROPERTY_ID || ''
    const clientEmail = process.env.GA_SA_CLIENT_EMAIL || ''
    const privateKey = process.env.GA_SA_PRIVATE_KEY || ''

    const debugInfo: any = {
      environment: {
        propertyId: propertyId,
        clientEmail: clientEmail,
        hasPrivateKey: !!privateKey,
        privateKeyLength: privateKey?.length || 0,
        privateKeyStartsWith: privateKey?.substring(0, 20) || 'N/A',
        privateKeyEndsWith: privateKey?.substring(privateKey.length - 20) || 'N/A'
      },
      tests: []
    }

    // Test 1: Environment variables
    if (!propertyId || !clientEmail || !privateKey) {
      debugInfo.tests.push({
        test: 'Environment Variables',
        status: 'FAILED',
        details: {
          propertyId: !!propertyId,
          clientEmail: !!clientEmail,
          privateKey: !!privateKey
        }
      })
    } else {
      debugInfo.tests.push({
        test: 'Environment Variables',
        status: 'PASSED',
        details: 'All required environment variables are present'
      })
    }

    // Test 2: Service account authentication
    let analyticsDataClient: any;
    try {
      analyticsDataClient = new BetaAnalyticsDataClient({
        credentials: {
          client_email: clientEmail,
          private_key: privateKey.replace(/\\n/g, '\n'),
        },
      })
      debugInfo.tests.push({
        test: 'Service Account Authentication',
        status: 'PASSED',
        details: 'Analytics client created successfully'
      })
    } catch (error) {
      debugInfo.tests.push({
        test: 'Service Account Authentication',
        status: 'FAILED',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
      return NextResponse.json({
        success: false,
        error: 'Service account authentication failed',
        debugInfo
      })
    }

    // Test 3: Try different property ID formats
    const propertyFormats: any = [
      `properties/${propertyId}`,
      `properties/${propertyId}`,
      `properties/${propertyId}`,
      `properties/${propertyId}`,
    ]

    for (const [index, propertyFormat] of propertyFormats.entries()) {
      try {
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
          ],
        })

        debugInfo.tests.push({
          test: `Property Format ${index + 1}: ${propertyFormat}`,
          status: 'PASSED',
          details: {
            rowCount: response.rows?.length || 0,
            hasData: (response.rows?.length || 0) > 0
          }
        })

        return NextResponse.json({
          success: true,
          message: 'GA4 connection successful',
          workingPropertyFormat: propertyFormat,
          debugInfo
        })
      } catch (error) {
        debugInfo.tests.push({
          test: `Property Format ${index + 1}: ${propertyFormat}`,
          status: 'FAILED',
          details: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Test 4: Try to list accounts (this might work even if property access doesn't)
    try {
      const [accounts] = await analyticsDataClient.listAccounts()
      debugInfo.tests.push({
        test: 'List Accounts',
        status: 'PASSED',
        details: {
          accountCount: accounts?.length || 0,
          accounts: accounts?.map((acc : any) => ({
            name: acc.name,
            displayName: acc.displayName,
            regionCode: acc.regionCode
          })) || []
        }
      })
    } catch (error) {
      debugInfo.tests.push({
        test: 'List Accounts',
        status: 'FAILED',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    return NextResponse.json({
      success: false,
      error: 'All property format attempts failed',
      debugInfo
    })

  } catch (error) {
    console.error('GA4 Debug Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Debug test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
