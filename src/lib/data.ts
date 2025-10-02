import { Provider } from '@/types'

// Mock data for MVP - this will be replaced with Supabase data
export const mockProviders: Provider[] = [
  {
    id: '1',
    name: 'Chris Evans',
    category: 'djs',
    position: 1,
    rating: 5,
    verified: true,
    country: 'USA',
    location: 'New York, NY',
    image: '/api/placeholder/150/150',
    skills: {
      punctuality: 5,
      professionalism: 5,
      reliability: 5,
      price: 4,
      clientSatisfaction: 5
    },
    bio: 'Professional DJ with 10+ years of experience in NYC nightlife and events.',
    portfolio: [],
    contact: {
      email: 'chris@example.com',
      phone: '+1 (555) 123-4567',
      website: 'https://chrisevansdj.com',
      instagram: '@chrisevansdj'
    }
  },
  {
    id: '2',
    name: 'Lucas Pereira',
    category: 'djs',
    position: 2,
    rating: 4.8,
    verified: true,
    country: 'Brazil',
    location: 'New York, NY',
    image: '/api/placeholder/150/150',
    skills: {
      punctuality: 5,
      professionalism: 5,
      reliability: 4,
      price: 5,
      clientSatisfaction: 5
    },
    bio: 'Brazilian DJ specializing in Latin music and international events.',
    portfolio: [],
    contact: {
      email: 'lucas@example.com',
      phone: '+1 (555) 234-5678',
      instagram: '@lucaspereira'
    }
  },
  {
    id: '3',
    name: 'Juan Martinez',
    category: 'djs',
    position: 3,
    rating: 4.7,
    verified: false,
    country: 'Mexico',
    location: 'New York, NY',
    image: '/api/placeholder/150/150',
    skills: {
      punctuality: 4,
      professionalism: 5,
      reliability: 4,
      price: 4,
      clientSatisfaction: 5
    },
    bio: 'Versatile DJ with expertise in multiple genres and event types.',
    portfolio: [],
    contact: {
      email: 'juan@example.com',
      phone: '+1 (555) 345-6789'
    }
  },
  {
    id: '4',
    name: 'Mark Johnson',
    category: 'djs',
    position: 4,
    rating: 4.6,
    verified: true,
    country: 'USA',
    location: 'New York, NY',
    image: '/api/placeholder/150/150',
    skills: {
      punctuality: 5,
      professionalism: 4,
      reliability: 5,
      price: 3,
      clientSatisfaction: 4
    },
    bio: 'High-end DJ for luxury events and corporate functions.',
    portfolio: [],
    contact: {
      email: 'mark@example.com',
      phone: '+1 (555) 456-7890',
      website: 'https://markjohnsondj.com'
    }
  },
  {
    id: '5',
    name: 'David Smith',
    category: 'djs',
    position: 5,
    rating: 4.5,
    verified: false,
    country: 'USA',
    location: 'New York, NY',
    image: '/api/placeholder/150/150',
    skills: {
      punctuality: 4,
      professionalism: 4,
      reliability: 4,
      price: 5,
      clientSatisfaction: 4
    },
    bio: 'Budget-friendly DJ perfect for small to medium events.',
    portfolio: [],
    contact: {
      email: 'david@example.com',
      phone: '+1 (555) 567-8901'
    }
  },
  {
    id: '6',
    name: 'Mark Davis',
    category: 'djs',
    position: 6,
    rating: 4.4,
    verified: false,
    country: 'USA',
    location: 'New York, NY',
    image: '/api/placeholder/150/150',
    skills: {
      punctuality: 4,
      professionalism: 4,
      reliability: 4,
      price: 4,
      clientSatisfaction: 4
    },
    bio: 'Creative DJ with unique style and innovative mixes.',
    portfolio: [],
    contact: {
      email: 'markd@example.com',
      phone: '+1 (555) 678-9012'
    }
  },
  // Photographers
  {
    id: '7',
    name: 'Sarah Wilson',
    category: 'photographers',
    position: 1,
    rating: 5,
    verified: true,
    country: 'USA',
    location: 'New York, NY',
    image: '/api/placeholder/150/150',
    skills: {
      punctuality: 5,
      professionalism: 5,
      reliability: 5,
      price: 4,
      clientSatisfaction: 5
    },
    bio: 'Award-winning photographer specializing in weddings and corporate events.',
    portfolio: [],
    contact: {
      email: 'sarah@example.com',
      phone: '+1 (555) 789-0123',
      website: 'https://sarahwilsonphoto.com',
      instagram: '@sarahwilsonphoto'
    }
  },
  {
    id: '8',
    name: 'Alex Chen',
    category: 'photographers',
    position: 2,
    rating: 4.9,
    verified: true,
    country: 'USA',
    location: 'New York, NY',
    image: '/api/placeholder/150/150',
    skills: {
      punctuality: 5,
      professionalism: 5,
      reliability: 5,
      price: 3,
      clientSatisfaction: 5
    },
    bio: 'Fashion and event photographer with international recognition.',
    portfolio: [],
    contact: {
      email: 'alex@example.com',
      phone: '+1 (555) 890-1234',
      instagram: '@alexchenphoto'
    }
  },
  // Videographers
  {
    id: '9',
    name: 'Mike Rodriguez',
    category: 'videographers',
    position: 1,
    rating: 5,
    verified: true,
    country: 'USA',
    location: 'New York, NY',
    image: '/api/placeholder/150/150',
    skills: {
      punctuality: 5,
      professionalism: 5,
      reliability: 5,
      price: 4,
      clientSatisfaction: 5
    },
    bio: 'Professional videographer with expertise in event coverage and promotional videos.',
    portfolio: [],
    contact: {
      email: 'mike@example.com',
      phone: '+1 (555) 901-2345',
      website: 'https://mikerodriguezvideo.com',
      instagram: '@mikerodriguezvideo'
    }
  },
  {
    id: '10',
    name: 'Emma Thompson',
    category: 'videographers',
    position: 2,
    rating: 4.8,
    verified: true,
    country: 'USA',
    location: 'New York, NY',
    image: '/api/placeholder/150/150',
    skills: {
      punctuality: 5,
      professionalism: 5,
      reliability: 4,
      price: 5,
      clientSatisfaction: 5
    },
    bio: 'Creative videographer specializing in wedding films and corporate content.',
    portfolio: [],
    contact: {
      email: 'emma@example.com',
      phone: '+1 (555) 012-3456',
      instagram: '@emmathompsonvideo'
    }
  }
]

export function getProvidersByCategory(category: string, searchQuery?: string): Provider[] {
  let providers = mockProviders.filter(provider => provider.category === category)
  
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    providers = providers.filter(provider => 
      provider.name.toLowerCase().includes(query) ||
      provider.bio.toLowerCase().includes(query) ||
      provider.location.toLowerCase().includes(query)
    )
  }
  
  return providers.sort((a, b) => a.position - b.position)
}
