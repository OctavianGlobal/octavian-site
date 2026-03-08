// ============================================================
// src/app/api/signals/publish/route.ts
// Octavian Global — Publish a signal (draft → published)
// Called by: pipeline GitHub Actions, admin UI
// Auth: service role key (server-to-server) OR admin session
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, createServerSupabaseClient } from '@/lib/supabase'
import { getUser } from '@/lib/auth'

const PIPELINE_SECRET = process.env.PIPELINE_SECRET

// ── Helper: is this a pipeline request? ───────────────────
function isPipelineRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !PIPELINE_SECRET) return false
  return authHeader === `Bearer ${PIPELINE_SECRET}`
}

// ── Helper: is this an authenticated admin? ───────────────
async function isAdminUser(): Promise<boolean> {
  const user = await getUser()
  if (!user) return false
  // Check for admin role in user metadata or a separate admin table
  // Adjust to match your admin setup
  return user.app_metadata?.role === 'admin'
}

export async function POST(request: NextRequest) {
  try {
    // Auth check: pipeline secret OR admin session
    const pipeline = isPipelineRequest(request)
    const admin = pipeline ? false : await isAdminUser()

    if (!pipeline && !admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      signal_id,     // publish existing draft by ID
      signal,        // OR create + publish in one operation (from pipeline)
    } = body

    const supabase = createServiceClient() // service role bypasses RLS

    // ── Publish existing draft ────────────────────────────
    if (signal_id) {
      const { data: existing, error: fetchError } = await supabase
        .from('signals')
        .select('id, status, title')
        .eq('id', signal_id)
        .single()

      if (fetchError || !existing) {
        return NextResponse.json({ error: 'Signal not found' }, { status: 404 })
      }

      if (existing.status === 'published') {
        return NextResponse.json({ error: 'Signal is already published' }, { status: 409 })
      }

      const { data: updated, error: updateError } = await supabase
        .from('signals')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', signal_id)
        .select()
        .single()

      if (updateError) {
        console.error('[api/signals/publish] Update error:', updateError.message)
        return NextResponse.json({ error: 'Failed to publish signal' }, { status: 500 })
      }

      return NextResponse.json({ success: true, signal: updated })
    }

    // ── Create + publish from pipeline ───────────────────
    if (signal) {
      const {
        cluster_id,
        title,
        slug,
        domain,
        summary,
        body: signalBody,
        thesis,
        indicators,
        implications,
        watch_list,
        impact,
        score,
        confidence,
      } = signal

      // Required field validation
      if (!title || !slug || !domain || !summary || !thesis) {
        return NextResponse.json(
          { error: 'Missing required signal fields: title, slug, domain, summary, thesis' },
          { status: 400 }
        )
      }

      // Check slug uniqueness
      const { data: slugCheck } = await supabase
        .from('signals')
        .select('id')
        .eq('slug', slug)
        .single()

      if (slugCheck) {
        return NextResponse.json(
          { error: `Slug '${slug}' already exists` },
          { status: 409 }
        )
      }

      const now = new Date().toISOString()
      const { data: created, error: insertError } = await supabase
        .from('signals')
        .insert({
          cluster_id: cluster_id ?? null,
          title,
          slug,
          domain,
          summary,
          body: signalBody ?? '',
          thesis,
          indicators: indicators ?? [],
          implications: implications ?? [],
          watch_list: watch_list ?? [],
          impact: impact ?? 'medium',
          score: score ?? null,
          confidence: confidence ?? null,
          status: 'published',
          published_at: now,
        })
        .select()
        .single()

      if (insertError) {
        console.error('[api/signals/publish] Insert error:', insertError.message)
        return NextResponse.json({ error: 'Failed to create signal' }, { status: 500 })
      }

      return NextResponse.json({ success: true, signal: created }, { status: 201 })
    }

    return NextResponse.json(
      { error: 'Provide either signal_id (to publish draft) or signal object (to create)' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[api/signals/publish] Unhandled error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
