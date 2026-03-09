// ============================================================
// src/app/api/signals/draft/route.ts
// Octavian Global — AI brief drafting via Claude Haiku
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getUser } from '@/lib/auth'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { signal_id } = await request.json()
    if (!signal_id) return NextResponse.json({ error: 'signal_id required' }, { status: 400 })

    const supabase = createServiceClient() as any

    const { data, error } = await supabase
      .from('signals')
      .select(`
        id,
        clusters (
          id,
          cluster_summary,
          primary_domain,
          domains_jsonb,
          top_entities_jsonb,
          top_tags_jsonb,
          first_seen_at,
          cluster_scores (
            signal_score_raw,
            power_score,
            money_score,
            rules_score
          )
        )
      `)
      .eq('id', signal_id)
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
        .select('name')
        .in('id', entityIds.slice(0, 8))
      entityNames = (entityRows ?? []).map((e: any) => e.name)
    }

    // Resolve tag UUIDs → names
    let tagNames: string[] = []
    const tagIds: string[] = cluster.top_tags_jsonb ?? []
    if (tagIds.length > 0) {
      const { data: tagRows } = await supabase
        .from('tags')
        .select('name')
        .in('id', tagIds.slice(0, 8))
      tagNames = (tagRows ?? []).map((t: any) => t.name.replace(/_/g, ' '))
    }

    // Count source items
    const { count: itemCount } = await supabase
      .from('cluster_items')
      .select('*', { count: 'exact', head: true })
      .eq('cluster_id', cluster.id)

    const scorePct = scores.signal_score_raw !== null
      ? Math.round(scores.signal_score_raw * 100)
      : null

    const domains: string[] = cluster.domains_jsonb?.length
      ? cluster.domains_jsonb
      : cluster.primary_domain ? [cluster.primary_domain] : []

    const detectedDate = cluster.first_seen_at
      ? new Date(cluster.first_seen_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

    const prompt = `You are an intelligence analyst writing a brief for Octavian Global, a strategic signal intelligence platform.

Write a brief using EXACTLY this format (markdown):

**[TITLE]**
*Published: ${detectedDate} · ${domains.join(' / ')}*

## Signal
[One paragraph, 2-3 sentences. What happened, specific facts, direct language.${entityNames.length ? ` Entities: ${entityNames.join(', ')}.` : ''}]

## Why It Matters
- [Strategic implication 1]
- [Strategic implication 2]
- [Strategic implication 3]

## Watch
- [Specific observable indicator 1]
- [Specific observable indicator 2]
- [Specific observable indicator 3]

---

Signal data:
- Summary: ${cluster.cluster_summary ?? 'No summary available'}
- Domains: ${domains.join(', ')}
- Signal score: ${scorePct !== null ? `${scorePct}/100` : 'unknown'}
- Source items: ${itemCount ?? 1}
${entityNames.length ? `- Entities: ${entityNames.join(', ')}` : ''}
${tagNames.length ? `- Tags: ${tagNames.join(', ')}` : ''}

Rules:
- 120-220 words total
- No fluff, no hedging
- Watch bullets must be specific and observable, not generic
- Do not invent facts not in the signal data
- Return ONLY the brief markdown, nothing else`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    })

    const draft = (message.content[0] as any).text?.trim() ?? ''
    const titleMatch = draft.match(/^\*\*(.+?)\*\*/m)
    const suggested_title = titleMatch ? titleMatch[1].trim() : null

    return NextResponse.json({ draft, suggested_title })

  } catch (err) {
    console.error('[api/signals/draft]', err)
    return NextResponse.json({ error: 'Draft generation failed' }, { status: 500 })
  }
}
