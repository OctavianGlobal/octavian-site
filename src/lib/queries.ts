// ============================================================
// src/lib/queries.ts
// Octavian Global — Live Supabase data queries
// ============================================================

import { createServerSupabaseClient } from '@/lib/supabase'
import { getSubscriptionTier, getTierPermissions } from '@/lib/auth'
import type {
  Signal,
  Category,
  SignalPublic,
  ClusterScore,
  SignalDomain,
} from '@/types/supabase'

export async function getPublishedSignals(opts: {
  domain?: SignalDomain
  limit?: number
  offset?: number
} = {}): Promise<{ signals: SignalPublic[]; count: number }> {
  const supabase = await createServerSupabaseClient()
  const tier = await getSubscriptionTier()
  const perms = getTierPermissions(tier)

  let query = supabase
    .from('signals')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(opts.limit ?? 20)

  if (opts.offset) query = query.range(opts.offset, opts.offset + (opts.limit ?? 20) - 1)
  if (opts.domain) query = query.eq('domain', opts.domain)

  const { data, count, error } = await query

  if (error) {
    console.error('[getPublishedSignals]', error.message)
    return { signals: [], count: 0 }
  }

  const rows = data as Signal[] | null

  const signals: SignalPublic[] = (rows ?? []).map((signal) => ({
    ...signal,
    score: perms.canViewScores ? signal.score : null,
    confidence: perms.canViewConfidence ? signal.confidence : null,
  }))

  return { signals, count: count ?? 0 }
}

export async function getSignalBySlug(slug: string): Promise<SignalPublic | null> {
  const supabase = await createServerSupabaseClient()
  const tier = await getSubscriptionTier()
  const perms = getTierPermissions(tier)

  const { data, error } = await supabase
    .from('signals')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !data) return null

  const row = data as Signal

  return {
    ...row,
    score: perms.canViewScores ? row.score : null,
    confidence: perms.canViewConfidence ? row.confidence : null,
  }
}

export async function getSignalsByCategory(
  categorySlug: string,
  limit = 10
): Promise<SignalPublic[]> {
  const supabase = await createServerSupabaseClient()
  const tier = await getSubscriptionTier()
  const perms = getTierPermissions(tier)

  const { data, error } = await supabase
    .from('signals')
    .select(`
      *,
      clusters (
        tags (
          categories (slug)
        )
      )
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []

  return (data as any[])
    .filter((s) => {
      const slugs = s.clusters?.tags?.categories?.map((c: any) => c.slug) ?? []
      return slugs.includes(categorySlug)
    })
    .map((signal) => ({
      ...signal,
      score: perms.canViewScores ? signal.score : null,
      confidence: perms.canViewConfidence ? signal.confidence : null,
    }))
}

export async function searchSignals(opts: {
  query: string
  domain?: SignalDomain
  limit?: number
}): Promise<{ signals: SignalPublic[]; restricted: boolean }> {
  const tier = await getSubscriptionTier()
  const perms = getTierPermissions(tier)

  if (!perms.canSearchArchive) {
    return { signals: [], restricted: true }
  }

  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from('signals')
    .select('*')
    .eq('status', 'published')
    .textSearch('title', opts.query, { type: 'websearch' })
    .order('published_at', { ascending: false })
    .limit(opts.limit ?? 20)

  if (opts.domain) query = query.eq('domain', opts.domain)

  if (perms.archiveDaysBack !== 'unlimited') {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - perms.archiveDaysBack)
    query = query.gte('published_at', cutoff.toISOString())
  }

  const { data, error } = await query
  if (error || !data) return { signals: [], restricted: false }

  const rows = data as Signal[]

  return {
    restricted: false,
    signals: rows.map((signal) => ({
      ...signal,
      score: perms.canViewScores ? signal.score : null,
      confidence: perms.canViewConfidence ? signal.confidence : null,
    })),
  }
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('domain', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('[getCategories]', error.message)
    return []
  }

  return (data as Category[]) ?? []
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return data as Category
}

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
        top_entities_jsonb,
        top_tags_jsonb
      ),
      cluster_scores (
        power_score,
        money_score,
        rules_score,
        signal_score_raw,
        ai_confidence
      )
    `)
    .eq('status', 'candidate')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('[getDashboardData]', error.message)
    return { recentSignals: [], categories: [], tier, permissions: perms }
  }

  const rows = data as any[]

  const recentSignals: SignalPublic[] = rows.map((s) => ({
    id: s.id,
    title: s.clusters?.cluster_summary ?? 'Untitled Signal',
    slug: s.id,
    domain: 'POWER' as const,
    summary: s.clusters?.cluster_summary ?? '',
    body: '',
    thesis: '',
    indicators: [],
    implications: [],
    watch_list: [],
    impact: 'medium' as const,
    score: perms.canViewScores ? (s.cluster_scores?.signal_score_raw ?? null) : null,
    confidence: perms.canViewConfidence ? (s.cluster_scores?.ai_confidence ?? null) : null,
    status: s.status,
    published_at: null,
    archived_at: null,
    created_at: s.created_at,
    updated_at: s.created_at,
    cluster_id: s.cluster_id,
  }))

  return {
    recentSignals,
    categories: [],
    tier,
    permissions: perms,
  }
}

export async function getClusterScores(limit = 10): Promise<ClusterScore[]> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('cluster_scores')
    .select(`
      *,
      clusters (
        id,
        label,
        domain,
        entity_ids
      )
    `)
    .order('scored_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[getClusterScores]', error.message)
    return []
  }

  return (data as ClusterScore[]) ?? []
}