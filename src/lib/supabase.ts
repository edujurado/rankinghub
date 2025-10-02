import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      providers: {
        Row: {
          id: string
          name: string
          category: 'djs' | 'photographers' | 'videographers'
          position: number
          rating: number
          verified: boolean
          country: string
          location: string
          image_url: string
          bio: string
          email: string
          phone: string
          website?: string
          instagram?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: 'djs' | 'photographers' | 'videographers'
          position: number
          rating: number
          verified?: boolean
          country: string
          location: string
          image_url: string
          bio: string
          email: string
          phone: string
          website?: string
          instagram?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: 'djs' | 'photographers' | 'videographers'
          position?: number
          rating?: number
          verified?: boolean
          country?: string
          location?: string
          image_url?: string
          bio?: string
          email?: string
          phone?: string
          website?: string
          instagram?: string
          created_at?: string
          updated_at?: string
        }
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
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          provider_id?: string
          punctuality?: number
          professionalism?: number
          reliability?: number
          price?: number
          client_satisfaction?: number
          created_at?: string
          updated_at?: string
        }
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
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          provider_id?: string
          name: string
          email: string
          phone?: string
          event_date?: string
          event_type?: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          provider_id?: string
          name?: string
          email?: string
          phone?: string
          event_date?: string
          event_type?: string
          message?: string
          created_at?: string
        }
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          subscribed_at: string
          active: boolean
        }
        Insert: {
          id?: string
          email: string
          subscribed_at?: string
          active?: boolean
        }
        Update: {
          id?: string
          email?: string
          subscribed_at?: string
          active?: boolean
        }
      }
    }
  }
}
