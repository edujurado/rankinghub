'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Mail, 
  Eye, 
  TrendingUp, 
  Star, 
  MessageSquare,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter
} from 'lucide-react'

interface DashboardStats {
  totalProviders: number
  totalContacts: number
  totalViews: number
  totalReviews: number
  recentContacts: any[]
  topProviders: any[]
  analyticsData: any[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // TODO: Fetch real data from Supabase
    setStats({
      totalProviders: 16,
      totalContacts: 45,
      totalViews: 1250,
      totalReviews: 32,
      recentContacts: [
        { id: 1, name: 'John Doe', email: 'john@example.com', provider: 'Chris Evans', date: '2024-01-15' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', provider: 'Sarah Wilson', date: '2024-01-14' }
      ],
      topProviders: [
        { name: 'Chris Evans', views: 150, contacts: 12, rating: 5.0 },
        { name: 'Sarah Wilson', views: 140, contacts: 10, rating: 5.0 },
        { name: 'Mike Rodriguez', views: 130, contacts: 8, rating: 5.0 }
      ],
      analyticsData: []
    })
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'providers', name: 'Providers', icon: Users },
    { id: 'contacts', name: 'Contacts', icon: Mail },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp },
    { id: 'settings', name: 'Settings', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="btn-primary">
                <Plus size={20} className="mr-2" />
                Add Provider
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-yellow-400 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent size={20} />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Providers
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats?.totalProviders}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Mail className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Contacts
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats?.totalContacts}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Eye className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Views
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats?.totalViews}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Star className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Reviews
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats?.totalReviews}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Contacts</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {stats?.recentContacts.map((contact) => (
                    <div key={contact.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                          <p className="text-sm text-gray-500">{contact.email}</p>
                          <p className="text-sm text-gray-500">Contacted: {contact.provider}</p>
                        </div>
                        <div className="text-sm text-gray-500">{contact.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Top Providers</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {stats?.topProviders.map((provider, index) => (
                    <div key={index} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{provider.name}</p>
                          <p className="text-sm text-gray-500">
                            {provider.views} views • {provider.contacts} contacts
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Star size={16} className="text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm text-gray-900">{provider.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'providers' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Manage Providers</h3>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search providers..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Filter size={20} />
                    <span>Filter</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-500">Provider management interface will be implemented here.</p>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Contact Submissions</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-500">Contact management interface will be implemented here.</p>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-500">Analytics dashboard will be implemented here.</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Settings</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-500">Settings interface will be implemented here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
