// ============================================================
// src/app/api/pipeline/health/route.ts
// Octavian Global — Pipeline health endpoint for dashboard widget
// Admin/editor only
// ============================================================

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { isAdmin, isEditor } from '@/lib/auth'

export async function GET() {
  try {
    const [adminFlag, editorFlag] = await Promise.all([isAdmin(), isEditor()])
    if (!adminFlag && !editorFlag) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient() as any

    const scripts = ['ingest', 'cluster', 'classify', 'score', 'baseline_refresh']
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data, error } = await supabase
      .from('pipeline_runs')
      .select('script, run_at, status, items_processed, items_total, api_errors, duration_seconds, notes')
      .gte('run_at', sevenDaysAgo.toISOString())
      .order('run_at', { ascending: false })

    if (error) {
      console.error('[api/pipeline/health]', error.message)
      return NextResponse.json({ error: 'Query failed' }, { status: 500 })
    }

    const rows = (data ?? []) as any[]

    const result = scripts.map((script) => {
      const scriptRuns = rows.filter((r) => r.script === script)
      const latest = scriptRuns[0] ?? null

      // For errors_7d, only count api_errors from failed/partial runs
      // to avoid alarming on historical build-period failures
      const errors7d = scriptRuns
        .filter((r) => r.status === 'failed' || r.status === 'partial')
        .reduce((s: number, r: any) => s + (r.api_errors ?? 0), 0)

      return {
        script,
        last_run_at:           latest?.run_at ?? null,
        last_status:           latest?.status ?? null,
        last_items_processed:  latest?.items_processed ?? null,
        last_items_total:      latest?.items_total ?? null,
        last_api_errors:       latest?.api_errors ?? null,
        last_duration_seconds: latest?.duration_seconds ?? null,
        last_notes:            latest?.notes ?? null,
        runs_7d:   scriptRuns.length,
        items_7d:  scriptRuns.reduce((s: number, r: any) => s + (r.items_processed ?? 0), 0),
        errors_7d: errors7d,
      }
    })

    return NextResponse.json(result)

  } catch (err) {
    console.error('[api/pipeline/health]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}