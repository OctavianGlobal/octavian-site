// ============================================================
// src/app/api/auth/login/route.ts
// Octavian Global — Email/password login via Supabase Auth
// Uses response-bound cookie pattern for Route Handler SSR sessions
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database, SubscriptionTier } from '@/types/supabase'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function createRouteClient(request: NextRequest, response: NextResponse) {
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const response = NextResponse.json({ success: true })
    const supabase = createRouteClient(request, response)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      const message =
        error.message === 'Invalid login credentials'
          ? 'Invalid email or password'
          : 'Authentication failed'
      return NextResponse.json({ error: message }, { status: 401 })
    }

    if (!data.session || !data.user) {
      return NextResponse.json({ error: 'No session returned' }, { status: 500 })
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status')
      .eq('id', data.user.id)
      .single()

    const profile = profileData as {
      subscription_tier: SubscriptionTier
      subscription_status: string | null
    } | null

    return NextResponse.json(
      {
        success: true,
        redirect: '/dashboard',
        user: {
          id: data.user.id,
          email: data.user.email,
          tier: profile?.subscription_tier ?? 'free',
          subscription_status: profile?.subscription_status ?? null,
        },
      },
      {
        status: 200,
        headers: response.headers,
      }
    )
  } catch (err) {
    console.error('[api/auth/login] Unhandled error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true })
    const supabase = createRouteClient(request, response)

    await supabase.auth.signOut()

    return NextResponse.json(
      { success: true },
      { headers: response.headers }
    )
  } catch (err) {
    console.error('[api/auth/login] Sign out error:', err)
    return NextResponse.json({ error: 'Sign out failed' }, { status: 500 })
  }
}