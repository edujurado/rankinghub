'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  Filter,
  Upload,
  Download,
  Check,
  X,
  AlertCircle
} from 'lucide-react'
import { 
  getDashboardStats, 
  getAllProviders, 
  createProvider, 
  updateProvider, 
  deleteProvider,
  importProvidersFromCSV,
  getAllContacts,
  updateContactStatus,
  deleteContact,
  DashboardStats,
  ContactSubmission
} from '@/lib/admin'
import { Provider } from '@/types'
import { getAdminProfile, updateAdminProfile } from '@/lib/admin'
import { signOut } from '@/lib/auth'
import AnalyticsOverview from './AnalyticsOverview'

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [providers, setProviders] = useState<Provider[]>([])
  const [contacts, setContacts] = useState<ContactSubmission[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddProvider, setShowAddProvider] = useState(false)
  const [showEditProvider, setShowEditProvider] = useState(false)
  const [deleteProviderId, setDeleteProviderId] = useState<string | null>(null)
  const [showCSVImport, setShowCSVImport] = useState(false)
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [adminProfile, setAdminProfile] = useState<{ id: string; email: string; name?: string; phone?: string } | null>(null)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const emptyProviderForm = {
    name: '',
    category: 'djs' as Provider['category'],
    position: 1,
    rating: 0,
    verified: false,
    country: '',
    location: '',
    image_url: '',
    bio: '',
    email: '',
    phone: '',
    website: '',
    instagram: '',
    skills: {
      punctuality: 0,
      professionalism: 0,
      reliability: 0,
      price: 0,
      client_satisfaction: 0,
    },
  }
  const [providerForm, setProviderForm] = useState<typeof emptyProviderForm>(emptyProviderForm)

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileDropdown) {
        setShowProfileDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showProfileDropdown])

  useEffect(() => {
    const loadProfile = async () => {
      if (activeTab === 'profile') {
        const profile = await getAdminProfile()
        setAdminProfile(profile)
      }
    }
    loadProfile()
  }, [activeTab])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, providersData, contactsData] = await Promise.all([
        getDashboardStats(),
        getAllProviders(),
        getAllContacts()
      ])
      
      setStats(statsData)
      setProviders(providersData)
      setContacts(contactsData)
      if (activeTab === 'profile') {
        const profile = await getAdminProfile()
        setAdminProfile(profile)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      showToast('Failed to load dashboard data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleDeleteProvider = async (id: string) => {
    const result = await deleteProvider(id)
    if (result.success) {
      showToast('Provider deleted successfully', 'success')
      loadDashboardData()
    } else {
      showToast(result.error || 'Failed to delete provider', 'error')
    }
  }

  const handleCSVImport = async () => {
    if (!csvFile) return

    setIsImporting(true)
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const csvData = e.target?.result as string
        const result = await importProvidersFromCSV(csvData)
        
        if (result.success) {
          showToast(`Successfully imported ${result.imported} providers`, 'success')
          setShowCSVImport(false)
          setCsvFile(null)
          loadDashboardData()
        } else {
          showToast(`Import failed: ${result.errors.join(', ')}`, 'error')
        }
      } catch (error) {
        showToast('Import failed: An error occurred during import', 'error')
      } finally {
        setIsImporting(false)
      }
    }
    reader.readAsText(csvFile)
  }

  const handleContactStatusUpdate = async (id: string, status: string) => {
    const result = await updateContactStatus(id, status)
    if (result.success) {
      showToast('Contact status updated', 'success')
      loadDashboardData()
    } else {
      showToast(result.error || 'Failed to update contact status', 'error')
    }
  }

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return
    
    const result = await deleteContact(id)
    if (result.success) {
      showToast('Contact deleted successfully', 'success')
      loadDashboardData()
    } else {
      showToast(result.error || 'Failed to delete contact', 'error')
    }
  }

  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.provider_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openAddProvider = () => {
    setProviderForm(emptyProviderForm)
    setShowAddProvider(true)
  }

  const openEditProvider = (p: Provider) => {
    setEditingProvider(p)
    setProviderForm({
      name: p.name,
      category: p.category,
      position: p.position,
      rating: p.rating,
      verified: p.verified,
      country: p.country,
      location: p.location,
      image_url: p.image,
      bio: p.bio,
      email: p.contact.email,
      phone: p.contact.phone,
      website: p.contact.website || '',
      instagram: p.contact.instagram || '',
      skills: {
        punctuality: p.skills.punctuality,
        professionalism: p.skills.professionalism,
        reliability: p.skills.reliability,
        price: p.skills.price,
        client_satisfaction: p.skills.clientSatisfaction,
      },
    })
    setShowEditProvider(true)
  }

  const submitAddProvider = async () => {
    const res = await createProvider(providerForm)
    if (res.success) {
      showToast('Provider added', 'success')
      setShowAddProvider(false)
      setProviderForm(emptyProviderForm)
      loadDashboardData()
    } else {
      showToast(res.error || 'Failed to add provider', 'error')
    }
  }

  const submitEditProvider = async () => {
    if (!editingProvider) return
    const res = await updateProvider(editingProvider.id, providerForm)
    if (res.success) {
      showToast('Provider updated', 'success')
      setShowEditProvider(false)
      setEditingProvider(null)
      loadDashboardData()
    } else {
      showToast(res.error || 'Failed to update provider', 'error')
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.replace('/')
  }

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
              <div className="relative inline-block text-left">
                <button 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Profile
                </button>
                {showProfileDropdown && (
                  <div className="origin-top-right absolute right-0 mt-2 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      <button
                        onClick={() => { setActiveTab('profile'); setShowProfileDropdown(false) }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex items-center justify-between">
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
                          <p className="text-sm text-gray-500">Contacted: {contact.provider_name || 'General Inquiry'}</p>
                        </div>
                        <div className="text-sm text-gray-500">{new Date(contact.created_at).toLocaleDateString()}</div>
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
                  {stats?.topProviders.map((provider: any, index: number) => (
                    <div key={index} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{provider.name}</p>
                          <p className="text-sm text-gray-500">
                            {provider.view_count || 0} views • {provider.contact_count || 0} contacts
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
          <div className="space-y-6">
            {/* Header with Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Manage Providers</h3>
                <div className="flex items-center space-x-4">
                    <button
                      onClick={openAddProvider}
                      className="flex items-center space-x-2 px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500"
                    >
                      <Plus size={20} />
                      <span>Add Provider</span>
                    </button>
                    <button
                      onClick={() => setShowCSVImport(true)}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Upload size={20} />
                      <span>Import CSV</span>
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search providers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Providers Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProviders.map((provider) => (
                      <tr key={provider.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded-full" src={provider.image} alt={provider.name} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                              <div className="text-sm text-gray-500">{provider.location}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {provider.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Star size={16} className="text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm text-gray-900">{provider.rating}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {provider.contact?.email ? 'Contacted' : 'No contact'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            provider.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {provider.verified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openEditProvider(provider)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteProviderId(provider.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="space-y-6">
            {/* Header */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Contact Submissions</h3>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search contacts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contacts Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredContacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                            <div className="text-sm text-gray-500">{contact.email}</div>
                            {contact.phone && (
                              <div className="text-sm text-gray-500">{contact.phone}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{contact.provider_name || 'General Inquiry'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{contact.event_type || 'N/A'}</div>
                          {contact.event_date && (
                            <div className="text-sm text-gray-500">{new Date(contact.event_date).toLocaleDateString()}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={contact.status}
                            onChange={(e) => handleContactStatusUpdate(contact.id, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="quoted">Quoted</option>
                            <option value="booked">Booked</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(contact.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDeleteContact(contact.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <AnalyticsOverview />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Admin Profile</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={adminProfile?.name || ''}
                  onChange={(e) => setAdminProfile(prev => prev ? { ...prev, name: e.target.value } : prev)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={adminProfile?.email || ''}
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={adminProfile?.phone || ''}
                  onChange={(e) => setAdminProfile(prev => prev ? { ...prev, phone: e.target.value } : prev)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={async () => {
                  if (!adminProfile) return
                  const res = await updateAdminProfile({ name: adminProfile.name, phone: adminProfile.phone })
                  if (res.success) showToast('Profile updated', 'success')
                  else showToast(res.error || 'Failed to update profile', 'error')
                }}
                className="px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* General Settings */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                  <input
                    type="text"
                    defaultValue="RankingHub"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                  <textarea
                    defaultValue="Find the best DJs, photographers, and videographers for your events"
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                  <input
                    type="email"
                    defaultValue="admin@rankinghub.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>
            </div>

            {/* Email Settings */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Email Settings</h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                  <input
                    type="text"
                    placeholder="smtp.gmail.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                    <input
                      type="number"
                      placeholder="587"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
                    <input
                      type="text"
                      placeholder="your-email@gmail.com"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>
            </div>

            {/* Analytics Settings */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Analytics & Tracking</h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Google Analytics ID</label>
                  <input
                    type="text"
                    placeholder="G-XXXXXXXXXX"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Google Tag Manager ID</label>
                  <input
                    type="text"
                    placeholder="GTM-XXXXXXX"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="tracking-enabled"
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <label htmlFor="tracking-enabled" className="ml-2 block text-sm text-gray-900">
                    Enable user tracking
                  </label>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="require-verification"
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <label htmlFor="require-verification" className="ml-2 block text-sm text-gray-900">
                    Require email verification for new providers
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="auto-approve"
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <label htmlFor="auto-approve" className="ml-2 block text-sm text-gray-900">
                    Auto-approve verified providers
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    defaultValue="60"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button className="px-6 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400">
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CSV Import Modal */}
      {showCSVImport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Import Providers from CSV</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                />
              </div>
              <div className="mb-4 text-sm text-gray-600">
                <p>CSV format should include columns:</p>
                <p className="text-xs mt-1">name, category, position, rating, verified, country, location, bio, email, phone, website, instagram, punctuality, professionalism, reliability, price, client_satisfaction</p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCSVImport(false)
                    setCsvFile(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCSVImport}
                  disabled={!csvFile || isImporting}
                  className="px-4 py-2 bg-yellow-400 text-white rounded-md hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isImporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Importing...
                    </>
                  ) : (
                    'Import'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Provider Modal */}
      {(showAddProvider || showEditProvider) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{showAddProvider ? 'Add Provider' : 'Edit Provider'}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    value={providerForm.name}
                    onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={providerForm.category}
                    onChange={(e) => setProviderForm({ ...providerForm, category: e.target.value as Provider['category'] })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="djs">DJs</option>
                    <option value="photographers">Photographers</option>
                    <option value="videographers">Videographers</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <input
                    type="number"
                    value={providerForm.position}
                    onChange={(e) => setProviderForm({ ...providerForm, position: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    value={providerForm.rating}
                    onChange={(e) => setProviderForm({ ...providerForm, rating: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    value={providerForm.country}
                    onChange={(e) => setProviderForm({ ...providerForm, country: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    value={providerForm.location}
                    onChange={(e) => setProviderForm({ ...providerForm, location: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    value={providerForm.image_url}
                    onChange={(e) => setProviderForm({ ...providerForm, image_url: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={providerForm.bio}
                    onChange={(e) => setProviderForm({ ...providerForm, bio: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    value={providerForm.email}
                    onChange={(e) => setProviderForm({ ...providerForm, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    value={providerForm.phone}
                    onChange={(e) => setProviderForm({ ...providerForm, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    value={providerForm.website}
                    onChange={(e) => setProviderForm({ ...providerForm, website: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                  <input
                    value={providerForm.instagram}
                    onChange={(e) => setProviderForm({ ...providerForm, instagram: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-5 gap-4">
                  {(['punctuality','professionalism','reliability','price','client_satisfaction'] as const).map((k) => (
                    <div key={k}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{k.replace('_', ' ')}</label>
                      <input
                        type="number"
                        value={providerForm.skills[k]}
                        onChange={(e) => setProviderForm({ ...providerForm, skills: { ...providerForm.skills, [k]: Number(e.target.value) } })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => { setShowAddProvider(false); setShowEditProvider(false); setEditingProvider(null) }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={showAddProvider ? submitAddProvider : submitEditProvider}
                  className="px-4 py-2 bg-yellow-400 text-white rounded-md hover:bg-yellow-500"
                >
                  {showAddProvider ? 'Create' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteProviderId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-1/3 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Provider</h3>
              <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete this provider? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteProviderId(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => { await handleDeleteProvider(deleteProviderId); setDeleteProviderId(null) }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-6 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center">
              {toast.type === 'success' ? (
                <Check size={20} className="mr-2" />
              ) : (
                <AlertCircle size={20} className="mr-2" />
              )}
              {toast.message}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
