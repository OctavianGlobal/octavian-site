// ============================================================
// src/app/api/signals/review/[id]/route.ts
// Octavian Global — Fetch single signal for editor review
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getUser } from '@/lib/auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createServiceClient() as any
    const { id } = params

    // Fetch signal + cluster + scores
    const { data, error } = await supabase
      .from('signals')
      .select(`
        id,
        cluster_id,
        status,
        created_at,
        published_title,
        published_body_md,
        clusters (
          id,
          cluster_summary,
          primary_domain,
          domains_jsonb,
          top_entities_jsonb,
          top_tags_jsonb,
          cluster_scores (
            signal_score_raw,
            power_score,
            money_score,
            rules_score,
            ai_confidence
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 })
    }

    const s = data as any
    const cluster = s.clusters ?? {}
    const scores = cluster.cluster_scores ?? {}

    // Resolve entity UUIDs → names
    let entityNames: string[] = []
    const entityIds: string[] = cluster.top_entities_jsonb ?? []
    if (entityIds.length > 0) {
      const { data: entityRows } = await supabase
        .from('entities')
        .select('id, name')
        .in('id', entityIds.slice(0, 10))
      entityNames = (entityRows ?? []).map((e: any) => e.name)
    }

    // Resolve tag UUIDs → names
    let tagNames: string[] = []
    const tagIds: string[] = cluster.top_tags_jsonb ?? []
    if (tagIds.length > 0) {
      const { data: tagRows } = await supabase
        .from('tags')
        .select('id, name')
        .in('id', tagIds.slice(0, 10))
      tagNames = (tagRows ?? []).map((t: any) => t.name)
    }

    // Count source items
    const { count: itemCount } = await supabase
      .from('cluster_items')
      .select('*', { count: 'exact', head: true })
      .eq('cluster_id', cluster.id)

    return NextResponse.json({
      id: s.id,
      cluster_id: s.cluster_id,
      status: s.status,
      created_at: s.created_at,
      published_title: s.published_title ?? null,
      published_body_md: s.published_body_md ?? null,
      cluster_summary: cluster.cluster_summary ?? null,
      primary_domain: cluster.primary_domain ?? null,
      domains_jsonb: cluster.domains_jsonb ?? [],
      entity_names: entityNames,
      tag_names: tagNames,
      item_count: itemCount ?? 0,
      signal_score_raw: scores.signal_score_raw ?? null,
      power_score: scores.power_score ?? null,
      money_score: scores.money_score ?? null,
      rules_score: scores.rules_score ?? null,
      ai_confidence: scores.ai_confidence ?? null,
    })
  } catch (err) {
    console.error('[api/signals/review/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
