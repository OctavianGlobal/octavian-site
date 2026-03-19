// ============================================================
// src/app/api/signals/rollback/route.ts
// Octavian Global — Roll back a published or archived signal
// to candidate status, clearing published_at, published_title,
// published_body_md, and reviewed_at so it can be redone.
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
    const { signal_id } = body

    if (!signal_id) {
      return NextResponse.json({ error: 'signal_id is required' }, { status: 400 })
    }

    const supabase = createServiceClient() as any

    // Verify signal exists and is published or archived
    const { data: existing, error: fetchError } = await supabase
      .from('signals')
      .select('id, status')
      .eq('id', signal_id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 })
    }

    if (existing.status === 'candidate') {
      return NextResponse.json({ error: 'Signal is already a candidate' }, { status: 409 })
    }

    if (!['published', 'archived'].includes(existing.status)) {
      return NextResponse.json({ error: `Cannot roll back signal with status: ${existing.status}` }, { status: 409 })
    }

    // Reset to candidate, clear all publish/archive-time fields
    const { data: updated, error: updateError } = await supabase
      .from('signals')
      .update({
        status: 'candidate',
        published_at: null,
        reviewed_at: null,
        published_title: null,
        published_body_md: null,
      })
      .eq('id', signal_id)
      .select()
      .single()

    if (updateError) {
      console.error('[api/signals/rollback] Update error:', updateError.message)
      return NextResponse.json({ error: 'Failed to roll back signal' }, { status: 500 })
    }

    return NextResponse.json({ success: true, signal: updated })
  } catch (error) {
    console.error('[api/signals/rollback] Unhandled error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
