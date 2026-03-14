// ============================================================
// src/app/api/signals/advanced-archive/route.ts
// Octavian Global — Advanced archive with multiple query types
// Supports preview (GET) and execute (POST)
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getProfile } from '@/lib/auth'

async function isEditorOrAdmin(): Promise<boolean> {
  const profile = await getProfile()
  return (profile?.is_editor ?? false) || (profile?.is_admin ?? false)
}

type ArchiveMode =
  | 'below_score'
  | 'null_scores'
  | 'older_than'
  | 'domain_below_score'
  | 'nuclear'

interface ArchiveParams {
  mode: ArchiveMode
  score?: number        // for below_score and domain_below_score (0-100)
  date?: string         // for older_than (ISO date string)
  domain?: string       // for domain_below_score
}

async function getAffectedSignalIds(
  supabase: any,
  params: ArchiveParams
): Promise<string[]> {
  const { mode, score, date, domain } = params

  if (mode === 'nuclear') {
    const { data } = await supabase
      .from('signals')
      .select('id')
      .eq('status', 'candidate')
    return (data ?? []).map((r: any) => r.id)
  }

  if (mode === 'null_scores') {
    const { data: nullRows } = await supabase
      .from('cluster_scores')
      .select('cluster_id')
      .is('signal_score_raw', null)

    const clusterIds = (nullRows ?? []).map((r: any) => r.cluster_id)
    if (clusterIds.length === 0) return []

    const { data } = await supabase
      .from('signals')
      .select('id')
      .eq('status', 'candidate')
      .in('cluster_id', clusterIds)
    return (data ?? []).map((r: any) => r.id)
  }

  if (mode === 'below_score' && score !== undefined) {
    const threshold = score / 100
    const { data: scoreRows } = await supabase
      .from('cluster_scores')
      .select('cluster_id')
      .or(`signal_score_raw.lt.${threshold},signal_score_raw.is.null`)

    const clusterIds = (scoreRows ?? []).map((r: any) => r.cluster_id)
    if (clusterIds.length === 0) return []

    const { data } = await supabase
      .from('signals')
      .select('id')
      .eq('status', 'candidate')
      .in('cluster_id', clusterIds)
    return (data ?? []).map((r: any) => r.id)
  }

  if (mode === 'older_than' && date) {
    const { data } = await supabase
      .from('signals')
      .select('id')
      .eq('status', 'candidate')
      .lt('created_at', new Date(date).toISOString())
    return (data ?? []).map((r: any) => r.id)
  }

  if (mode === 'domain_below_score' && domain && score !== undefined) {
    const threshold = score / 100
    const { data: clusterRows } = await supabase
      .from('clusters')
      .select('id')
      .eq('primary_domain', domain)
    const domainClusterIds = (clusterRows ?? []).map((r: any) => r.id)
    if (domainClusterIds.length === 0) return []

    const { data: scoreRows } = await supabase
      .from('cluster_scores')
      .select('cluster_id')
      .or(`signal_score_raw.lt.${threshold},signal_score_raw.is.null`)
      .in('cluster_id', domainClusterIds)
    const clusterIds = (scoreRows ?? []).map((r: any) => r.cluster_id)
    if (clusterIds.length === 0) return []

    const { data } = await supabase
      .from('signals')
      .select('id')
      .eq('status', 'candidate')
      .in('cluster_id', clusterIds)
    return (data ?? []).map((r: any) => r.id)
  }

  return []
}

// ── GET — Preview count ───────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const authorized = await isEditorOrAdmin()
    if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') as ArchiveMode
    const score = searchParams.get('score') ? parseFloat(searchParams.get('score')!) : undefined
    const date = searchParams.get('date') ?? undefined
    const domain = searchParams.get('domain') ?? undefined

    if (!mode) return NextResponse.json({ error: 'Missing mode' }, { status: 400 })

    const supabase = createServiceClient() as any
    const ids = await getAffectedSignalIds(supabase, { mode, score, date, domain })

    return NextResponse.json({ count: ids.length })
  } catch (err) {
    console.error('[advanced-archive GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── POST — Execute archive ────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const authorized = await isEditorOrAdmin()
    if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { mode, score, date, domain, confirmed } = body

    if (!confirmed) return NextResponse.json({ error: 'Confirmation required' }, { status: 400 })
    if (!mode) return NextResponse.json({ error: 'Missing mode' }, { status: 400 })

    const supabase = createServiceClient() as any
    const ids = await getAffectedSignalIds(supabase, { mode, score, date, domain })

    if (ids.length === 0) {
      return NextResponse.json({ success: true, archived_count: 0 })
    }

    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('signals')
      .update({ status: 'archived', reviewed_at: now })
      .in('id', ids)
      .select('id')

    if (error) {
      console.error('[advanced-archive POST]', error.message)
      return NextResponse.json({ error: 'Archive failed' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      archived_count: data?.length ?? 0,
    })
  } catch (err) {
    console.error('[advanced-archive POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}