// ============================================================
// src/app/api/signals/archive/route.ts
// Octavian Global — Archive signals (published → archived)
// Also handles bulk archive queries for the archive browser
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, createServerSupabaseClient } from '@/lib/supabase'
import { getUser, getSubscriptionTier, getTierPermissions } from '@/lib/auth'
import type { SignalDomain } from '@/types/supabase'

const PIPELINE_SECRET = process.env.PIPELINE_SECRET

function isPipelineRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !PIPELINE_SECRET) return false
  return authHeader === `Bearer ${PIPELINE_SECRET}`
}

async function isAdminUser(): Promise<boolean> {
  const user = await getUser()
  if (!user) return false
  return user.app_metadata?.role === 'admin'
}

// ── POST — Archive a signal ───────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const pipeline = isPipelineRequest(request)
    const admin = pipeline ? false : await isAdminUser()

    if (!pipeline && !admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { signal_id, signal_ids } = body // single or bulk

    const supabase = createServiceClient()
    const now = new Date().toISOString()

    // Bulk archive
    if (signal_ids && Array.isArray(signal_ids)) {
      const { data, error } = await supabase
        .from('signals')
        .update({ status: 'archived', archived_at: now, updated_at: now })
        .in('id', signal_ids)
        .eq('status', 'published')
        .select('id, title')

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

    // Single archive
    if (signal_id) {
      const { data, error } = await supabase
        .from('signals')
        .update({ status: 'archived', archived_at: now, updated_at: now })
        .eq('id', signal_id)
        .eq('status', 'published') // can only archive published signals
        .select()
        .single()

      if (error || !data) {
        return NextResponse.json(
          { error: 'Signal not found or not in published status' },
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

// ── GET — Browse the archive (paid subscribers) ────────────
// /api/signals/archive?domain=POWER&entity=China&limit=20&offset=0
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
    const domain = searchParams.get('domain') as SignalDomain | null
    const entity = searchParams.get('entity')
    const search = searchParams.get('q')
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50)
    const offset = parseInt(searchParams.get('offset') ?? '0')

    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('signals')
      .select('id, title, slug, domain, impact, score, confidence, published_at, archived_at, summary', {
        count: 'exact',
      })
      .eq('status', 'archived')
      .order('archived_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (domain) query = query.eq('domain', domain)
    if (search) query = query.textSearch('title', search, { type: 'websearch' })

    // Date restriction based on tier
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

    const signals = (data ?? []).map((s) => ({
      ...s,
      score: perms.canViewScores ? s.score : null,
      confidence: perms.canViewConfidence ? s.confidence : null,
    }))

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
