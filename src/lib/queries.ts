// ============================================================
// src/lib/queries.ts
// Octavian Global — Live Supabase data queries
// Updated March 2026 — synced to real pipeline schema
//
// CANDIDATE_MAX_AGE_DAYS (30) must match cleanup.py.
// Candidates older than 30 days are auto-archived by cleanup.py
// and hidden from the dashboard queue by the .gte() filter here.
// The archive (status='archived') retains all historical signal data.
//
// UPDATE (2026-03-18): getDashboardData now fetches published_at,
// fetched_at, and item_age from the primary item in each cluster
// for display in the editor queue.
// ============================================================

import { createServerSupabaseClient } from '@/lib/supabase'
import { getSubscriptionTier, getTierPermissions } from '@/lib/auth'
import type {
  DashboardSignal,
  PublishedSignal,
  SignalDomain,
} from '@/types/supabase'

// ── Constants ─────────────────────────────────────────────────────────────────

// Must match CANDIDATE_MAX_AGE_DAYS in cleanup.py.
const CANDIDATE_MAX_AGE_DAYS = 30

// ── Dashboard — Signal Queue ──────────────────────────────────────────────────

export async function getDashboardData(opts: {
  domain?: SignalDomain
  sort?: 'date' | 'score'
  dir?: 'asc' | 'desc'
  limit?: number
  offset?: number
} = {}) {
  const supabase = await createServerSupabaseClient()
  const tier = await getSubscriptionTier()
  const perms = getTierPermissions(tier)

  const limit = opts.limit ?? 25
  const sort = opts.sort ?? 'date'
  const dir = opts.dir ?? 'desc'
  const ascending = dir === 'asc'

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - CANDIDATE_MAX_AGE_DAYS)
  const cutoffISO = cutoffDate.toISOString()

  // ── Step 1: resolve domain filter to cluster_ids ──
  let clusterIdFilter: string[] | null = null
  if (opts.domain) {
    const { data: clusterRows } = await supabase
      .from('clusters')
      .select('id')
      .eq('primary_domain', opts.domain)
    clusterIdFilter = (clusterRows ?? []).map((c: any) => c.id)
    if (clusterIdFilter.length === 0) {
      return { recentSignals: [], count: 0, tier, permissions: perms }
    }
  }

  // ── Step 2: build signals query ──
  let query = supabase
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
    `, { count: 'exact' })
    .eq('status', 'candidate')
    .gte('created_at', cutoffISO)

  if (clusterIdFilter) {
    query = query.in('cluster_id', clusterIdFilter)
  }

  if (sort === 'date') {
    query = query.order('created_at', { ascending })
    query = query.limit(limit)
    if (opts.offset) {
      query = query.range(opts.offset, opts.offset + limit - 1)
    }
  } else {
    query = query.order('created_at', { ascending: false }).limit(5000)
  }

  const { data, count, error } = await query

  if (error) {
    console.error('[getDashboardData]', error.message)
    return { recentSignals: [], count: 0, tier, permissions: perms }
  }

  const rows = data as any[]

  // ── Step 3: map rows ──
  let mapped: DashboardSignal[] = rows.map((s) => {
    const cluster = s.clusters ?? {}
    const scores = Array.isArray(cluster.cluster_scores)
      ? (cluster.cluster_scores[0] ?? {})
      : (cluster.cluster_scores ?? {})

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
      score: perms.canViewSignalScore ? rawScore : null,
      confidence: perms.canViewConfidence ? rawConfidence : null,
      primary_snippet: null,
      primary_source_name: null,
      primary_published_at: null,
      primary_fetched_at: null,
      primary_item_age: null,
    }
  })

  // ── Step 3b: fetch snippet, source name, published_at, fetched_at, item_age ──
  const clusterIds = mapped.map(m => m.cluster_id).filter(Boolean) as string[]
  if (clusterIds.length > 0) {
    try {
      const { data: ciRows } = await supabase
        .from('cluster_items')
        .select('cluster_id, item_id')
        .in('cluster_id', clusterIds)
.limit(10000)
      // One item per cluster — take first
      const clusterItemMap: Record<string, string> = {}
      for (const row of (ciRows ?? []) as any[]) {
        if (!clusterItemMap[row.cluster_id]) {
          clusterItemMap[row.cluster_id] = row.item_id
        }
      }

      const itemIds = Object.values(clusterItemMap)
      if (itemIds.length > 0) {
        const { data: itemRows } = await supabase
          .from('items')
          .select('id, snippet, source_id, published_at, fetched_at, item_age')
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

        const itemMap: Record<string, {
          snippet: string | null
          source_name: string | null
          published_at: string | null
          fetched_at: string | null
          item_age: number | null
        }> = {}

        for (const item of (itemRows ?? []) as any[]) {
          itemMap[item.id] = {
            snippet:      item.snippet ?? null,
            source_name:  item.source_id ? (sourceNameMap[item.source_id] ?? null) : null,
            published_at: item.published_at ?? null,
            fetched_at:   item.fetched_at ?? null,
            item_age:     item.item_age ?? null,
          }
        }

        mapped = mapped.map(m => {
          const itemId   = m.cluster_id ? clusterItemMap[m.cluster_id] : null
          const itemData = itemId ? itemMap[itemId] : null
          return {
            ...m,
            primary_snippet:      itemData?.snippet ?? null,
            primary_source_name:  itemData?.source_name ?? null,
            primary_published_at: itemData?.published_at ?? null,
            primary_fetched_at:   itemData?.fetched_at ?? null,
            primary_item_age:     itemData?.item_age ?? null,
          }
        })
      }
    } catch (e) {
      console.error('[getDashboardData] item fetch error', e)
    }
  }

  // ── Step 4: sort and paginate for score sort ──
  let totalCount = count ?? 0
  if (sort === 'score') {
    mapped.sort((a, b) =>
      ascending
        ? (a.signal_score_raw ?? 0) - (b.signal_score_raw ?? 0)
        : (b.signal_score_raw ?? 0) - (a.signal_score_raw ?? 0)
    )
    totalCount = mapped.length
    const offset = opts.offset ?? 0
    mapped = mapped.slice(offset, offset + limit)
  }

  return {
    recentSignals: mapped,
    count: totalCount,
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
          credibility_score,
          corroboration_score,
          severity_modifier,
          ai_confidence
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) return null

  const s = data as any
  const cluster = s.clusters ?? {}
  const scores = Array.isArray(cluster.cluster_scores)
    ? (cluster.cluster_scores[0] ?? {})
    : (cluster.cluster_scores ?? {})

  let entityNames: string[] = []
  const entityIds: string[] = cluster.top_entities_jsonb ?? []
  if (entityIds.length > 0) {
    const { data: entityRows } = await supabase
      .from('entities')
      .select('id, name')
      .in('id', entityIds.slice(0, 10))
    entityNames = (entityRows ?? []).map((e: any) => e.name)
  }

  let tagNames: string[] = []
  const tagIds: string[] = cluster.top_tags_jsonb ?? []
  if (tagIds.length > 0) {
    const { data: tagRows } = await supabase
      .from('tags')
      .select('id, name, domain')
      .in('id', tagIds.slice(0, 10))
    tagNames = (tagRows ?? []).map((t: any) => t.name)
  }

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
    evidence_score: scores.evidence_score ?? null,
    impact_score: scores.impact_score ?? null,
    novelty_score: scores.novelty_score ?? null,
    anomaly_score: scores.anomaly_score ?? null,
    credibility_score: scores.credibility_score ?? null,
    corroboration_score: scores.corroboration_score ?? null,
    severity_modifier: scores.severity_modifier ?? null,
  }
}

// ── Published briefs (public) ─────────────────────────────────────────────────

export async function getPublishedSignals(opts: {
  domain?: SignalDomain
  limit?: number
  offset?: number
} = {}): Promise<{ signals: PublishedSignal[]; count: number }> {
  const supabase = await createServerSupabaseClient()
  const tier = await getSubscriptionTier()
  const perms = getTierPermissions(tier)

  const limit = opts.limit ?? 20

  let clusterIdFilter: string[] | null = null
  if (opts.domain) {
    const { data: clusterRows } = await supabase
      .from('clusters')
      .select('id')
      .eq('primary_domain', opts.domain)
    clusterIdFilter = (clusterRows ?? []).map((c: any) => c.id)
    if (clusterIdFilter.length === 0) {
      return { signals: [], count: 0 }
    }
  }

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
    .limit(limit)

  if (clusterIdFilter) {
    query = query.in('cluster_id', clusterIdFilter)
  }

  if (opts.offset) {
    query = query.range(opts.offset, opts.offset + limit - 1)
  }

  const { data, count, error } = await query

  if (error) {
    console.error('[getPublishedSignals]', error.message)
    return { signals: [], count: 0 }
  }

  const rows = data as any[]

  const signals: PublishedSignal[] = rows.map((s) => {
    const cluster = s.clusters ?? {}
    const scores = Array.isArray(cluster.cluster_scores)
      ? (cluster.cluster_scores[0] ?? {})
      : (cluster.cluster_scores ?? {})
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
      score: perms.canViewSignalScore ? rawScore : null,
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
  const scores = Array.isArray(cluster.cluster_scores)
    ? (cluster.cluster_scores[0] ?? {})
    : (cluster.cluster_scores ?? {})
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
    score: perms.canViewSignalScore ? rawScore : null,
    confidence: perms.canViewConfidence ? rawConfidence : null,
  }
}

// ── Archive browse ────────────────────────────────────────────────────────────

export async function getArchivedSignals(opts: {
  domain?: SignalDomain
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
} = {}): Promise<{ signals: PublishedSignal[]; count: number; restricted: boolean }> {
  const tier = await getSubscriptionTier()
  const perms = getTierPermissions(tier)

  if (!perms.canSearchArchive) {
    return { signals: [], count: 0, restricted: true }
  }

  const supabase = await createServerSupabaseClient()
  const limit = opts.limit ?? 25

  let clusterIdFilter: string[] | null = null
  if (opts.domain) {
    const { data: clusterRows } = await supabase
      .from('clusters')
      .select('id')
      .eq('primary_domain', opts.domain)
    clusterIdFilter = (clusterRows ?? []).map((c: any) => c.id)
    if (clusterIdFilter.length === 0) {
      return { signals: [], count: 0, restricted: false }
    }
  }

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
    .order('created_at', { ascending: false })
    .limit(limit)

  if (clusterIdFilter) {
    query = query.in('cluster_id', clusterIdFilter)
  }

  if (opts.offset) {
    query = query.range(opts.offset, opts.offset + limit - 1)
  }

  if (opts.dateFrom) {
    query = query.gte('created_at', opts.dateFrom)
  }
  if (opts.dateTo) {
    query = query.lte('created_at', opts.dateTo)
  }

  const { data, count, error } = await query

  if (error) {
    console.error('[getArchivedSignals]', error.message)
    return { signals: [], count: 0, restricted: false }
  }

  const rows = data as any[]

  const signals: PublishedSignal[] = rows.map((s) => {
    const cluster = s.clusters ?? {}
    const scores = Array.isArray(cluster.cluster_scores)
      ? (cluster.cluster_scores[0] ?? {})
      : (cluster.cluster_scores ?? {})
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
      score: perms.canViewSignalScore ? rawScore : null,
      confidence: perms.canViewConfidence ? rawConfidence : null,
    }
  })

  return { signals, count: count ?? 0, restricted: false }
}
