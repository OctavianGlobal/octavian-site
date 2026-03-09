// ============================================================
// src/app/api/signals/archive/route.ts
// Octavian Global — Archive signals (published → archived)
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, createServerSupabaseClient } from '@/lib/supabase'
import { getProfile, getSubscriptionTier, getTierPermissions } from '@/lib/auth'

const PIPELINE_SECRET = process.env.PIPELINE_SECRET

function isPipelineRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !PIPELINE_SECRET) return false
  return authHeader === `Bearer ${PIPELINE_SECRET}`
}

async function isEditorOrAdmin(): Promise<boolean> {
  const profile = await getProfile()
  return (profile?.is_editor ?? false) || (profile?.is_admin ?? false)
}

// ── POST — Archive a signal ───────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const pipeline = isPipelineRequest(request)
    const authorized = pipeline ? true : await isEditorOrAdmin()

    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { signal_id, signal_ids } = body

    const supabase = createServiceClient() as any
    const now = new Date().toISOString()

    // ── Bulk archive ──────────────────────────────────────
    if (signal_ids && Array.isArray(signal_ids)) {
      const { data, error } = await supabase
        .from('signals')
        .update({ status: 'archived', reviewed_at: now })
        .in('id', signal_ids)
        .in('status', ['candidate', 'published'])
        .select('id, status')

      if (error) {
        console.error('[api/signals/archive] Bulk archive error:', error.message)
        return NextResponse.json({ error: 'Bulk archive failed' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        archived_count: data?.length ?? 0,
        archived: data,
      })
    }

    // ── Single archive ────────────────────────────────────
    if (signal_id) {
      const { data, error } = await supabase
        .from('signals')
        .update({ status: 'archived', reviewed_at: now })
        .eq('id', signal_id)
        .in('status', ['candidate', 'published'])
        .select()
        .single()

      if (error || !data) {
        return NextResponse.json(
          { error: 'Signal not found or already archived' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, signal: data })
    }

    return NextResponse.json(
      { error: 'Provide signal_id or signal_ids array' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[api/signals/archive] Unhandled error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── GET — Browse archive (paid subscribers) ──────────────
export async function GET(request: NextRequest) {
  try {
    const tier = await getSubscriptionTier()
    const perms = getTierPermissions(tier)

    if (!perms.canSearchArchive) {
      return NextResponse.json(
        {
          error: 'Archive access requires Signal Watch tier or above',
          required_tier: 'signal_watch',
          current_tier: tier,
        },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50)
    const offset = parseInt(searchParams.get('offset') ?? '0')

    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('signals')
      .select(`
        id,
        cluster_id,
        status,
        published_at,
        published_title,
        published_body_md,
        created_at,
        clusters (
          cluster_summary,
          primary_domain,
          cluster_scores (
            signal_score_raw,
            ai_confidence
          )
        )
      `, { count: 'exact' })
      .eq('status', 'archived')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (perms.archiveDaysBack !== 'unlimited') {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - perms.archiveDaysBack)
      query = query.gte('published_at', cutoff.toISOString())
    }

    const { data, count, error } = await query

    if (error) {
      console.error('[api/signals/archive GET] Query error:', error.message)
      return NextResponse.json({ error: 'Archive query failed' }, { status: 500 })
    }

    const rows = (data as any[]) ?? []

    const signals = rows
      .filter((s) => {
        if (domain) return s.clusters?.primary_domain === domain
        return true
      })
      .map((s) => {
        const cluster = s.clusters ?? {}
        const scores = cluster.cluster_scores ?? {}
        const rawScore = scores.signal_score_raw ?? null
        const rawConfidence = scores.ai_confidence ?? null

        return {
          id: s.id,
          cluster_id: s.cluster_id,
          status: s.status,
          published_at: s.published_at,
          published_title: s.published_title,
          published_body_md: s.published_body_md,
          created_at: s.created_at,
          primary_domain: cluster.primary_domain ?? null,
          cluster_summary: cluster.cluster_summary ?? null,
          score: perms.canViewScores ? rawScore : null,
          confidence: perms.canViewConfidence ? rawConfidence : null,
        }
      })

    return NextResponse.json({
      signals,
      count: count ?? 0,
      tier,
      archive_limit_days: perms.archiveDaysBack,
    })
  } catch (error) {
    console.error('[api/signals/archive GET] Unhandled error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
