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

const SYSTEM_PROMPT = `You are a strategic intelligence analyst for Octavian Global, a signal intelligence platform. You write concise, authoritative briefs for senior analysts and decision-makers.

BRIEF FORMAT — follow this exactly, in markdown:

**[Title]**

**Signal**
One paragraph (2-4 sentences) explaining what happened. Factual, direct, no editorializing.

**Why It Matters**
- [Strategic implication 1]
- [Strategic implication 2]
- [Strategic implication 3]

**Watch**
- [Specific observable indicator 1]
- [Specific observable indicator 2]
- [Specific observable indicator 3]

**Sources**
[Source name 1] · [Source name 2] · [Source name 3]

VOICE RULES:
- Analytical, not alarmist
- Active voice, present tense where possible
- No hedging phrases like "it remains to be seen" or "time will tell"
- No jargon or acronyms without expansion
- Never mention signal scores, AI confidence, or internal platform data
- Do not speculate beyond what the source data supports
- The Why It Matters bullets explain strategic consequence — not just what happened
- The Watch bullets must be specific and observable, not generic (e.g. "Congressional committee markup scheduled for April" not "watch for legislative developments")

LENGTH: 120–220 words total. If you exceed 220 words, cut the weakest bullet.

Return ONLY the brief in markdown. No preamble, no explanation, no commentary.`


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
    const scoresArr = cluster.cluster_scores ?? {}
    const scores = Array.isArray(scoresArr) ? (scoresArr[0] ?? {}) : scoresArr

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
        .select('name, domain')
        .in('id', tagIds.slice(0, 8))
      tagNames = (tagRows ?? []).map((t: any) => t.name.replace(/_/g, ' '))
    }

    // Fetch actual source titles for the Sources section
    let sourceNames: string[] = []
    const { data: itemRows } = await supabase
      .from('cluster_items')
      .select('item_id')
      .eq('cluster_id', cluster.id)
      .limit(6)

    if (itemRows?.length) {
      const itemIds = itemRows.map((r: any) => r.item_id)
      const { data: items } = await supabase
        .from('items')
        .select('source_id')
        .in('id', itemIds)

      if (items?.length) {
        const sourceIds = [...new Set(items.map((i: any) => i.source_id))].slice(0, 3)
        const { data: sources } = await supabase
          .from('sources')
          .select('name')
          .in('id', sourceIds)
        sourceNames = (sources ?? []).map((s: any) => s.name)
      }
    }

    const domains: string[] = cluster.domains_jsonb?.length
      ? cluster.domains_jsonb
      : cluster.primary_domain ? [cluster.primary_domain] : []

    const detectedDate = cluster.first_seen_at
      ? new Date(cluster.first_seen_at).toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric'
        })
      : new Date().toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric'
        })

    const userPrompt = `Write an Octavian Global brief for the following signal.

SIGNAL DATA:
- Summary: ${cluster.cluster_summary ?? 'No summary available'}
- Detected: ${detectedDate}
- Domains: ${domains.join(', ')}
- Power score: ${scores.power_score !== null ? `${scores.power_score}/5` : 'unknown'}
- Money score: ${scores.money_score !== null ? `${scores.money_score}/5` : 'unknown'}
- Rules score: ${scores.rules_score !== null ? `${scores.rules_score}/5` : 'unknown'}
${entityNames.length ? `- Key entities: ${entityNames.join(', ')}` : ''}
${tagNames.length ? `- Topics: ${tagNames.join(', ')}` : ''}
${sourceNames.length ? `- Sources: ${sourceNames.join(', ')}` : ''}

Write the brief now.`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
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