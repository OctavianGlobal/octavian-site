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

  const [signalsResult, categoriesResult] = await Promise.all([
    supabase
      .from('signals')
      .select('id, title, slug, domain, impact, score, confidence, published_at, summary, status, created_at')
      .eq('status', 'candidate')
      .order('created_at', { ascending: false })
      .limit(20),

    supabase
      .from('categories')
      .select('id, name, slug, domain, signal_count')
      .order('signal_count', { ascending: false })
      .limit(6),
  ])

  const rows = signalsResult.data as Pick<Signal,
    'id' | 'title' | 'slug' | 'domain' | 'impact' |
    'score' | 'confidence' | 'published_at' | 'summary' |
    'status' | 'created_at'
  >[] | null

  const recentSignals: SignalPublic[] = (rows ?? []).map((s) => ({
    ...s,
    score: perms.canViewScores ? s.score : null,
    confidence: perms.canViewConfidence ? s.confidence : null,
    body: '',
    thesis: '',
    indicators: [],
    implications: [],
    watch_list: [],
    archived_at: null,
    updated_at: '',
    cluster_id: null,
  }))

  return {
    recentSignals,
    categories: (categoriesResult.data as Category[]) ?? [],
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