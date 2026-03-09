// ============================================================
// src/app/api/signals/publish/route.ts
// Octavian Global — Publish a signal (candidate → published)
// Signals are pipeline-created rows. Publishing sets status +
// published_title + published_body_md + published_at.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, createServerSupabaseClient } from '@/lib/supabase'
import { getProfile } from '@/lib/auth'

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

export async function POST(request: NextRequest) {
  try {
    const pipeline = isPipelineRequest(request)
    const authorized = pipeline ? true : await isEditorOrAdmin()

    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { signal_id, published_title, published_body_md } = body

    if (!signal_id) {
      return NextResponse.json(
        { error: 'signal_id is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient() as any

    // Verify signal exists and is a candidate
    const { data: existing, error: fetchError } = await supabase
      .from('signals')
      .select('id, status, cluster_id')
      .eq('id', signal_id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 })
    }

    if (existing.status === 'published') {
      return NextResponse.json(
        { error: 'Signal is already published' },
        { status: 409 }
      )
    }

    if (existing.status === 'archived') {
      return NextResponse.json(
        { error: 'Cannot publish an archived signal' },
        { status: 409 }
      )
    }

    const now = new Date().toISOString()

    const updatePayload: Record<string, unknown> = {
      status: 'published',
      published_at: now,
      reviewed_at: now,
    }

    if (published_title !== undefined) {
      updatePayload.published_title = published_title
    }

    if (published_body_md !== undefined) {
      updatePayload.published_body_md = published_body_md
    }

    const { data: updated, error: updateError } = await supabase
      .from('signals')
      .update(updatePayload)
      .eq('id', signal_id)
      .select()
      .single()

    if (updateError) {
      console.error('[api/signals/publish] Update error:', updateError.message)
      return NextResponse.json(
        { error: 'Failed to publish signal' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, signal: updated })
  } catch (error) {
    console.error('[api/signals/publish] Unhandled error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
