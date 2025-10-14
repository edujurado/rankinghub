'use client'

import { useState } from 'react'
import { trackEvent, trackProviderView, trackContactForm, trackSearch, trackCategoryFilter } from '@/lib/gtag'

export default function TestAnalyticsPage() {
  const [testResults, setTestResults] = useState<string[]>([])

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testProviderView = () => {
    trackProviderView('Test DJ', 'djs')
    addResult('✅ Tracked provider view: Test DJ (djs)')
  }

  const testContactForm = () => {
    trackContactForm('Test Provider', 'wedding')
    addResult('✅ Tracked contact form: Test Provider (wedding)')
  }

  const testSearch = () => {
    trackSearch('test query', 5)
    addResult('✅ Tracked search: "test query" (5 results)')
  }

  const testCategoryFilter = () => {
    trackCategoryFilter('photographers')
    addResult('✅ Tracked category filter: photographers')
  }

  const testCustomEvent = () => {
    trackEvent('custom_test_event', {
      test_parameter: 'test_value',
      event_category: 'testing'
    })
    addResult('✅ Tracked custom event: custom_test_event')
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">GA4 Analytics Test Page</h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test GA4 Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={testProviderView}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Test Provider View
              </button>
              
              <button
                onClick={testContactForm}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Test Contact Form
              </button>
              
              <button
                onClick={testSearch}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Test Search
              </button>
              
              <button
                onClick={testCategoryFilter}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Test Category Filter
              </button>
              
              <button
                onClick={testCustomEvent}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Test Custom Event
              </button>
              
              <button
                onClick={clearResults}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear Results
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
            <div className="bg-gray-100 rounded-lg p-4 max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500">No test results yet. Click the buttons above to test GA4 events.</p>
              ) : (
                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono text-gray-700">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Verify GA4 Tracking</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Open your browser's Developer Tools (F12)</li>
              <li>Go to the Network tab</li>
              <li>Click the test buttons above</li>
              <li>Look for requests to <code>google-analytics.com</code> or <code>googletagmanager.com</code></li>
              <li>Check the Console tab for any GA4-related messages</li>
              <li>Visit your Google Analytics dashboard to see real-time events (may take a few minutes)</li>
            </ol>
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">GA4 Configuration</h3>
            <div className="text-yellow-800">
              <p><strong>Measurement ID:</strong> G-0RR1L0RM4X</p>
              <p><strong>Property ID:</strong> 507764257</p>
              <p><strong>Service Account:</strong> rankinghub-ga4-service-account@rankinghub-analitycs.iam.gserviceaccount.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
