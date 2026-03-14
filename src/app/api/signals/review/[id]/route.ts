// src/app/api/signals/review/[id]/route.ts
// ============================================================
// Octavian Global — Fetch single signal for editor review
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getUser } from '@/lib/auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createServiceClient() as any
    const { id } = await params

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
            evidence_score,
            impact_score,
            novelty_score,
            anomaly_score,
            credibility_score,
            corroboration_score,
            severity_modifier,
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

    const scores = Array.isArray(cluster.cluster_scores)
      ? (cluster.cluster_scores[0] ?? {})
      : (cluster.cluster_scores ?? {})

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

    // Fetch source items + source name
    const { data: clusterItemRows } = await supabase
      .from('cluster_items')
      .select('item_id')
      .eq('cluster_id', cluster.id)
      .limit(5)

    let sourceItems: {
      title: string | null
      url: string | null
      snippet: string | null
      source_name: string | null
    }[] = []

    const itemIds = (clusterItemRows ?? []).map((ci: any) => ci.item_id)
    if (itemIds.length > 0) {
      const { data: itemRows } = await supabase
        .from('items')
        .select('title, url, snippet, source_id')
        .in('id', itemIds)

      const sourceIds = [...new Set(
        (itemRows ?? []).map((i: any) => i.source_id).filter(Boolean)
      )]

      let sourceNameMap: Record<string, string> = {}
      if (sourceIds.length > 0) {
        const { data: sourceRows } = await supabase
          .from('sources')
          .select('id, name')
          .in('id', sourceIds)
        sourceNameMap = Object.fromEntries(
          (sourceRows ?? []).map((src: any) => [src.id, src.name])
        )
      }

      sourceItems = (itemRows ?? []).map((item: any) => ({
        title: item.title ?? null,
        url: item.url ?? null,
        snippet: item.snippet ?? null,
        source_name: sourceNameMap[item.source_id] ?? null,
      }))
    }

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
      source_items: sourceItems,
      signal_score_raw: scores.signal_score_raw ?? null,
      power_score: scores.power_score ?? null,
      money_score: scores.money_score ?? null,
      rules_score: scores.rules_score ?? null,
      ai_confidence: scores.ai_confidence ?? null,
      evidence_score: scores.evidence_score ?? null,
      impact_score: scores.impact_score ?? null,
      novelty_score: scores.novelty_score ?? null,
      anomaly_score: scores.anomaly_score ?? null,
      credibility_score: scores.credibility_score ?? null,
      corroboration_score: scores.corroboration_score ?? null,
      severity_modifier: scores.severity_modifier ?? null,
    })
  } catch (err) {
    console.error('[api/signals/review/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}