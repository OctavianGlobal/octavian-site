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