export interface Provider {
  id: string
  name: string
  category: 'djs' | 'photographers' | 'videographers'
  position: number
  rating: number
  verified: boolean
  country: string
  location: string
  image: string
  skills: {
    punctuality: number
    professionalism: number
    reliability: number
    price: number
    clientSatisfaction: number
  }
  bio: string
  portfolio: string[]
  contact: {
    email: string
    phone: string
    website?: string
    instagram?: string
  }
}

export interface RankingFilters {
  category: string
  searchQuery?: string
  sortBy?: 'rating' | 'price' | 'popularity'
}
