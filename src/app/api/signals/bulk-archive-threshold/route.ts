// ============================================================
// src/app/api/signals/bulk-archive-threshold/route.ts
// Octavian Global — Bulk archive all candidates below score threshold
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getProfile } from '@/lib/auth'

async function isEditorOrAdmin(): Promise<boolean> {
  const profile = await getProfile()
  return (profile?.is_editor ?? false) || (profile?.is_admin ?? false)
}

export async function POST(request: NextRequest) {
  try {
    const authorized = await isEditorOrAdmin()
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const threshold = parseFloat(body.threshold ?? '0.40')

    if (isNaN(threshold) || threshold < 0 || threshold > 1) {
      return NextResponse.json({ error: 'Invalid threshold' }, { status: 400 })
    }

    const supabase = createServiceClient() as any

    // Find all candidate signal IDs below threshold
    const { data: scoreRows, error: scoreError } = await supabase
      .from('cluster_scores')
      .select('cluster_id, signal_score_raw')
      .lt('signal_score_raw', threshold)

    if (scoreError) {
      return NextResponse.json({ error: 'Score query failed' }, { status: 500 })
    }

    const clusterIds = (scoreRows ?? []).map((r: any) => r.cluster_id)

    if (clusterIds.length === 0) {
      return NextResponse.json({ success: true, archived_count: 0 })
    }

    // Find candidate signals in those clusters
    const { data: signalRows, error: signalError } = await supabase
      .from('signals')
      .select('id')
      .eq('status', 'candidate')
      .in('cluster_id', clusterIds)

    if (signalError) {
      return NextResponse.json({ error: 'Signal query failed' }, { status: 500 })
    }

    const signalIds = (signalRows ?? []).map((r: any) => r.id)

    if (signalIds.length === 0) {
      return NextResponse.json({ success: true, archived_count: 0 })
    }

    // Bulk archive
    const now = new Date().toISOString()
    const { data, error: archiveError } = await supabase
      .from('signals')
      .update({ status: 'archived', reviewed_at: now })
      .in('id', signalIds)
      .select('id')

    if (archiveError) {
      return NextResponse.json({ error: 'Archive failed' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      archived_count: data?.length ?? 0,
    })

  } catch (err) {
    console.error('[bulk-archive-threshold]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Preview — GET returns count without archiving
export async function GET(request: NextRequest) {
  try {
    const authorized = await isEditorOrAdmin()
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const threshold = parseFloat(searchParams.get('threshold') ?? '0.40')

    const supabase = createServiceClient() as any

    const { data: scoreRows } = await supabase
      .from('cluster_scores')
      .select('cluster_id')
      .lt('signal_score_raw', threshold)

    const clusterIds = (scoreRows ?? []).map((r: any) => r.cluster_id)

    if (clusterIds.length === 0) {
      return NextResponse.json({ count: 0 })
    }

    const { count } = await supabase
      .from('signals')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'candidate')
      .in('cluster_id', clusterIds)

    return NextResponse.json({ count: count ?? 0 })

  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}