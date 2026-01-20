import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

/**
 * POST /api/admin/providers/bulk-update
 * Bulk update is_direct_provider flag for multiple providers
 * Body: { providerIds: string[], is_direct_provider: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { providerIds, is_direct_provider } = body

    if (!Array.isArray(providerIds) || providerIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'providerIds must be a non-empty array' },
        { status: 400 }
      )
    }

    if (typeof is_direct_provider !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'is_direct_provider must be a boolean' },
        { status: 400 }
      )
    }

    // Bulk update providers
    const { data, error } = await supabase
      .from('providers')
      .update({ is_direct_provider })
      .in('id', providerIds)
      .select('id, name, is_direct_provider')

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      updated: data?.length || 0,
      providers: data
    })
  } catch (error) {
    console.error('Error in bulk update:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
