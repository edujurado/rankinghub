import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Database types
 * 
 * Architecture:
 * - providers: Canonical, frontend-facing table with merged data
 * - provider_sources: Raw API data from Yelp and Google
 * - provider_matches: Confidence scores linking sources to providers
 */
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description?: string
          icon?: string
          color?: string
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string
          icon?: string
          color?: string
          is_active?: boolean
          sort_order?: number
        }
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      /**
       * Providers table - Canonical, frontend-facing
       * Contains ONLY merged/synthesized fields
       * API-specific data is stored in provider_sources
       */
      providers: {
        Row: {
          id: string
          name: string
          category_id: string
          position: number
          rating: number
          verified: boolean
          featured: boolean
          country: string
          location: string
          city?: string
          state?: string
          zip_code?: string
          latitude?: number
          longitude?: number
          image_url: string
          bio: string
          short_bio?: string
          email: string
          phone: string
          website?: string
          instagram?: string
          facebook?: string
          twitter?: string
          youtube?: string
          tiktok?: string
          linkedin?: string
          price_range?: string
          availability_status?: string
          years_experience?: number
          languages?: string[]
          service_areas?: string[]
          specialties?: string[]
          equipment_list?: string[]
          awards?: string[]
          certifications?: string[]
          portfolio_images?: string[]
          portfolio_videos?: string[]
          social_proof_count: number
          view_count: number
          contact_count: number
          is_active: boolean
          is_claimed: boolean
          claimed_at?: string
          last_updated_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category_id: string
          position: number
          rating: number
          verified?: boolean
          featured?: boolean
          country: string
          location: string
          city?: string
          state?: string
          zip_code?: string
          latitude?: number
          longitude?: number
          image_url: string
          bio: string
          short_bio?: string
          email: string
          phone: string
          website?: string
          instagram?: string
          facebook?: string
          twitter?: string
          youtube?: string
          tiktok?: string
          linkedin?: string
          price_range?: string
          availability_status?: string
          years_experience?: number
          languages?: string[]
          service_areas?: string[]
          specialties?: string[]
          equipment_list?: string[]
          awards?: string[]
          certifications?: string[]
          portfolio_images?: string[]
          portfolio_videos?: string[]
          social_proof_count?: number
          view_count?: number
          contact_count?: number
          is_active?: boolean
          is_claimed?: boolean
          claimed_at?: string
        }
        Update: Partial<Database['public']['Tables']['providers']['Insert']>
      }
      /**
       * Provider Sources table - Raw API data storage
       * Stores data from Yelp and Google Places APIs
       * Each record represents one business from one source
       */
      provider_sources: {
        Row: {
          id: string
          source: 'yelp' | 'google'
          source_provider_id: string
          provider_id?: string | null
          category_slug: string
          // Normalized fields
          name: string
          phone_normalized?: string | null
          address?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country: string
          latitude?: number | null
          longitude?: number | null
          rating?: number | null
          review_count: number
          price_range?: string | null
          photo_url?: string | null
          website?: string | null
          categories?: string[] | null
          // Yelp-specific fields
          yelp_alias?: string | null
          yelp_url?: string | null
          yelp_display_phone?: string | null
          yelp_is_closed?: boolean | null
          yelp_transactions?: string[] | null
          yelp_distance?: number | null
          yelp_business_hours?: Record<string, unknown> | null
          yelp_attributes?: Record<string, unknown> | null
          yelp_image_url?: string | null
          // Google-specific fields
          google_formatted_address?: string | null
          google_types?: string[] | null
          google_international_phone?: string | null
          google_photos?: Record<string, unknown>[] | null
          google_viewport?: Record<string, unknown> | null
          google_html_attributions?: string[] | null
          // Raw data
          raw_data: Record<string, unknown>
          fetched_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          source: 'yelp' | 'google'
          source_provider_id: string
          provider_id?: string | null
          category_slug: string
          name: string
          phone_normalized?: string | null
          address?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string
          latitude?: number | null
          longitude?: number | null
          rating?: number | null
          review_count?: number
          price_range?: string | null
          photo_url?: string | null
          website?: string | null
          categories?: string[] | null
          // Yelp-specific fields
          yelp_alias?: string | null
          yelp_url?: string | null
          yelp_display_phone?: string | null
          yelp_is_closed?: boolean | null
          yelp_transactions?: string[] | null
          yelp_distance?: number | null
          yelp_business_hours?: Record<string, unknown> | null
          yelp_attributes?: Record<string, unknown> | null
          yelp_image_url?: string | null
          // Google-specific fields
          google_formatted_address?: string | null
          google_types?: string[] | null
          google_international_phone?: string | null
          google_photos?: Record<string, unknown>[] | null
          google_viewport?: Record<string, unknown> | null
          google_html_attributions?: string[] | null
          // Raw data
          raw_data: Record<string, unknown>
          fetched_at?: string
        }
        Update: Partial<Database['public']['Tables']['provider_sources']['Insert']>
      }
      /**
       * Provider Matches table - Confidence scores and audit trail
       * Links provider_sources to canonical providers
       * Stores match confidence and field-level breakdown
       */
      provider_matches: {
        Row: {
          id: string
          provider_id: string
          source: 'yelp' | 'google'
          source_provider_id: string
          confidence_score: number
          match_type: 'auto' | 'partial' | 'manual'
          matched_fields?: {
            name_score: number
            phone_match: boolean
            phone_score: number
            address_score: number
            website_match: boolean
            website_score: number
            geo_distance_meters: number | null
            geo_score: number
            total_score: number
          } | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          source: 'yelp' | 'google'
          source_provider_id: string
          confidence_score: number
          match_type: 'auto' | 'partial' | 'manual'
          matched_fields?: Record<string, unknown> | null
        }
        Update: Partial<Database['public']['Tables']['provider_matches']['Insert']>
      }
      skills: {
        Row: {
          id: string
          provider_id: string
          punctuality: number
          professionalism: number
          reliability: number
          price: number
          client_satisfaction: number
          communication?: number
          creativity?: number
          flexibility?: number
          overall_rating?: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          punctuality: number
          professionalism: number
          reliability: number
          price: number
          client_satisfaction: number
          communication?: number
          creativity?: number
          flexibility?: number
        }
        Update: Partial<Database['public']['Tables']['skills']['Insert']>
      }
      contact_submissions: {
        Row: {
          id: string
          provider_id?: string
          name: string
          email: string
          phone?: string
          event_date?: string
          event_type?: string
          event_location?: string
          guest_count?: number
          budget_range?: string
          message: string
          status: string
          admin_notes?: string
          provider_response?: string
          follow_up_date?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider_id?: string
          name: string
          email: string
          phone?: string
          event_date?: string
          event_type?: string
          event_location?: string
          guest_count?: number
          budget_range?: string
          message: string
          status?: string
          admin_notes?: string
          provider_response?: string
          follow_up_date?: string
        }
        Update: Partial<Database['public']['Tables']['contact_submissions']['Insert']>
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          first_name?: string
          last_name?: string
          interests?: string[]
          source?: string
          status: string
          subscribed_at: string
          unsubscribed_at?: string
          last_email_sent?: string
          email_count: number
        }
        Insert: {
          id?: string
          email: string
          first_name?: string
          last_name?: string
          interests?: string[]
          source?: string
          status?: string
        }
        Update: Partial<Database['public']['Tables']['newsletter_subscribers']['Insert']>
      }
      reviews: {
        Row: {
          id: string
          provider_id: string
          client_name: string
          client_email: string
          rating: number
          title?: string
          comment?: string
          event_type?: string
          event_date?: string
          is_verified: boolean
          is_featured: boolean
          is_public: boolean
          admin_notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          client_name: string
          client_email: string
          rating: number
          title?: string
          comment?: string
          event_type?: string
          event_date?: string
          is_verified?: boolean
          is_featured?: boolean
          is_public?: boolean
          admin_notes?: string
        }
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt?: string
          content: string
          featured_image?: string
          author_name?: string
          author_email?: string
          category?: string
          tags?: string[]
          meta_title?: string
          meta_description?: string
          is_published: boolean
          is_featured: boolean
          view_count: number
          published_at?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string
          content: string
          featured_image?: string
          author_name?: string
          author_email?: string
          category?: string
          tags?: string[]
          meta_title?: string
          meta_description?: string
          is_published?: boolean
          is_featured?: boolean
          view_count?: number
          published_at?: string
        }
        Update: Partial<Database['public']['Tables']['blog_posts']['Insert']>
      }
    }
  }
}

// Type helpers
export type ProviderSource = Database['public']['Tables']['provider_sources']['Row']
export type ProviderSourceInsert = Database['public']['Tables']['provider_sources']['Insert']
export type ProviderSourceUpdate = Database['public']['Tables']['provider_sources']['Update']

export type ProviderMatch = Database['public']['Tables']['provider_matches']['Row']
export type ProviderMatchInsert = Database['public']['Tables']['provider_matches']['Insert']
export type ProviderMatchUpdate = Database['public']['Tables']['provider_matches']['Update']

export type Provider = Database['public']['Tables']['providers']['Row']
export type ProviderInsert = Database['public']['Tables']['providers']['Insert']
export type ProviderUpdate = Database['public']['Tables']['providers']['Update']

export type Category = Database['public']['Tables']['categories']['Row']
