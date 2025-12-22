import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/test-data
 * Returns JSON of imported providers with all API data
 * All data comes from single providers table
 */
export async function GET() {
  try {
    const { data: providers, error } = await supabase
      .from('providers')
      .select(`
        id,
        name,
        category_id,
        position,
        rating,
        location,
        city,
        state,
        image_url,
        phone,
        website,
        google_place_id,
        google_rating,
        google_review_count,
        google_photo_url,
        google_address,
        yelp_id,
        yelp_alias,
        yelp_rating,
        yelp_review_count,
        yelp_photo_url,
        yelp_url,
        yelp_price,
        yelp_display_phone,
        yelp_is_closed,
        yelp_transactions,
        yelp_distance,
        api_sync_status,
        last_synced_at,
        rh_client_satisfaction,
        rh_service_quality,
        rh_punctuality,
        rh_communication,
        rh_value_perceived,
        rh_score,
        rh_score_calculated_at,
        categories (
          name,
          slug
        )
      `)
      .eq('is_active', true)
      .order('category_id', { ascending: true })
      .order('position', { ascending: true })
      .limit(100)

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Transform data to include category info
    const transformedData = providers?.map(provider => ({
      ...provider,
      category: provider.categories?.slug || 'unknown',
      category_name: provider.categories?.name || 'Unknown',
      // Combined metrics
      combined_rating: provider.google_rating && provider.yelp_rating 
        ? ((provider.google_rating + provider.yelp_rating) / 2).toFixed(1)
        : provider.google_rating || provider.yelp_rating || provider.rating,
      total_reviews: (provider.google_review_count || 0) + (provider.yelp_review_count || 0)
    })) || []

    return NextResponse.json({
      success: true,
      count: transformedData.length,
      data: transformedData
    })
  } catch (error) {
    console.error('Error fetching test data:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
