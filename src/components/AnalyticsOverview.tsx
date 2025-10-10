'use client'

import { useState, useEffect } from 'react'
import { Users, UserPlus, Clock, Eye } from 'lucide-react'

interface AnalyticsData {
  activeUsers: number
  newUsers: number
  averageSessionDuration: number
  totalPageViews: number
  period: string
  lastUpdated: string
}

export default function AnalyticsOverview() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/analytics/summary')
        const result = await response.json()

        if (result.success) {
          setData(result.data)
        } else {
          setError(result.error || 'Failed to fetch analytics data')
        }
      } catch (err) {
        setError('Network error while fetching analytics')
        console.error('Analytics fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Overview</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Overview</h3>
        <div className="text-red-600 bg-red-50 p-3 rounded">
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-1">Make sure GA4 environment variables are configured.</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Overview</h3>
        <p className="text-gray-500">No analytics data available</p>
      </div>
    )
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Analytics Overview</h3>
        <span className="text-sm text-gray-500">Last 7 days</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-900">Active Users</p>
              <p className="text-2xl font-bold text-blue-600">{data.activeUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <UserPlus className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-900">New Users</p>
              <p className="text-2xl font-bold text-green-600">{data.newUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-900">Avg. Session</p>
              <p className="text-2xl font-bold text-purple-600">{formatDuration(data.averageSessionDuration)}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-900">Page Views</p>
              <p className="text-2xl font-bold text-orange-600">{data.totalPageViews.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Last updated: {new Date(data.lastUpdated).toLocaleString()}
      </div>
    </div>
  )
}