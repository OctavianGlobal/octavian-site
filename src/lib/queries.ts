// ============================================================
// src/lib/queries.ts
// Octavian Global — Live Supabase data queries
// Updated March 2026 — synced to real pipeline schema
// ============================================================

import { createServerSupabaseClient } from '@/lib/supabase'
import { getSubscriptionTier, getTierPermissions } from '@/lib/auth'
import type {
  Signal,
  Cluster,
  ClusterScore,
  DashboardSignal,
  PublishedSignal,
  SignalDomain,
} from '@/types/supabase'

// ── Dashboard — Signal Queue (candidates for editorial review) ────────────────

export async function getDashboardData() {
  const supabase = await createServerSupabaseClient()
  const tier = await getSubscriptionTier()
  const perms = getTierPermissions(tier)

  const { data, error } = await supabase
    .from('signals')
    .select(`
      id,
      status,
      created_at,
      cluster_id,
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
    .eq('status', 'candidate')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[getDashboardData]', error.message)
    return { recentSignals: [], tier, permissions: perms }
  }

  const rows = data as any[]

  const recentSignals: DashboardSignal[] = rows.map((s) => {
    const cluster = s.clusters ?? {}
    const scores = cluster.cluster_scores ?? {}

    const rawScore = scores.signal_score_raw ?? null
    const rawConfidence = scores.ai_confidence ?? null

    return {
      id: s.id,
      status: s.status,
      created_at: s.created_at,
      cluster_id: s.cluster_id,
      cluster_summary: cluster.cluster_summary ?? null,
      primary_domain: cluster.primary_domain ?? null,
      domains_jsonb: (() => {
        const raw = cluster.domains_jsonb
        if (!raw) return null
        if (Array.isArray(raw)) return raw
        try { return JSON.parse(raw) } catch { return null }
      })(),
      top_entities_jsonb: cluster.top_entities_jsonb ?? [],
      top_tags_jsonb: cluster.top_tags_jsonb ?? [],
      signal_score_raw: rawScore,
      power_score: scores.power_score ?? null,
      money_score: scores.money_score ?? null,
      rules_score: scores.rules_score ?? null,
      ai_confidence: rawConfidence,
      // Tier-gated
      score: perms.canViewScores ? rawScore : null,
      confidence: perms.canViewConfidence ? rawConfidence : null,
    }
  })

  return {
    recentSignals,
    tier,
    permissions: perms,
  }
}

// ── Single candidate signal for editor review ─────────────────────────────────

export async function getSignalForReview(id: string) {
  const supabase = await createServerSupabaseClient()

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
        first_seen_at,
        last_seen_at,
        cluster_scores (
          signal_score_raw,
          power_score,
          money_score,
          rules_score,
          evidence_score,
          impact_score,
          novelty_score,
          anomaly_score,
          ai_confidence
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) return null

  const s = data as any
  const cluster = s.clusters ?? {}
  const scores = cluster.cluster_scores ?? {}

  // Resolve top_entities UUIDs to names
  let entityNames: string[] = []
  const entityIds: string[] = cluster.top_entities_jsonb ?? []
  if (entityIds.length > 0) {
    const { data: entityRows } = await supabase
      .from('entities')
      .select('id, name')
      .in('id', entityIds.slice(0, 10))
    entityNames = (entityRows ?? []).map((e: any) => e.name)
  }

  // Resolve top_tags UUIDs to names + domains
  let tagNames: string[] = []
  const tagIds: string[] = cluster.top_tags_jsonb ?? []
  if (tagIds.length > 0) {
    const { data: tagRows } = await supabase
      .from('tags')
      .select('id, name, domain')
      .in('id', tagIds.slice(0, 10))
    tagNames = (tagRows ?? []).map((t: any) => t.name)
  }

  // Count source items
  const { count: itemCount } = await supabase
    .from('cluster_items')
    .select('*', { count: 'exact', head: true })
    .eq('cluster_id', cluster.id)

  return {
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
  }
}



export async function getPublishedSignals(opts: {
  domain?: SignalDomain
  limit?: number
  offset?: number
} = {}): Promise<{ signals: PublishedSignal[]; count: number }> {
  const supabase = await createServerSupabaseClient()
  const tier = await getSubscriptionTier()
  const perms = getTierPermissions(tier)

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
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(opts.limit ?? 20)

  if (opts.offset) {
    query = query.range(opts.offset, opts.offset + (opts.limit ?? 20) - 1)
  }

  const { data, count, error } = await query

  if (error) {
    console.error('[getPublishedSignals]', error.message)
    return { signals: [], count: 0 }
  }

  const rows = data as any[]

  const signals: PublishedSignal[] = rows
    .filter((s) => {
      // If domain filter specified, match against cluster's primary_domain
      if (opts.domain) {
        return s.clusters?.primary_domain === opts.domain
      }
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

  return { signals, count: count ?? 0 }
}

// ── Single published brief by signal ID ──────────────────────────────────────

export async function getSignalById(id: string): Promise<PublishedSignal | null> {
  const supabase = await createServerSupabaseClient()
  const tier = await getSubscriptionTier()
  const perms = getTierPermissions(tier)

  const { data, error } = await supabase
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
    `)
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (error || !data) return null

  const s = data as any
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
}

// ── Archive browse (paid tiers) ───────────────────────────────────────────────

export async function getArchivedSignals(opts: {
  domain?: SignalDomain
  limit?: number
  offset?: number
} = {}): Promise<{ signals: PublishedSignal[]; count: number; restricted: boolean }> {
  const tier = await getSubscriptionTier()
  const perms = getTierPermissions(tier)

  if (!perms.canSearchArchive) {
    return { signals: [], count: 0, restricted: true }
  }

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
    .limit(opts.limit ?? 20)

  if (opts.offset) {
    query = query.range(opts.offset, opts.offset + (opts.limit ?? 20) - 1)
  }

  if (perms.archiveDaysBack !== 'unlimited') {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - perms.archiveDaysBack)
    query = query.gte('published_at', cutoff.toISOString())
  }

  const { data, count, error } = await query

  if (error) {
    console.error('[getArchivedSignals]', error.message)
    return { signals: [], count: 0, restricted: false }
  }

  const rows = data as any[]

  const signals: PublishedSignal[] = rows
    .filter((s) => {
      if (opts.domain) return s.clusters?.primary_domain === opts.domain
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

  return { signals, count: count ?? 0, restricted: false }
}
