import { createServerSupabaseClient } from '@/lib/supabase'
import type { SubscriptionTier, Profile } from '@/types/supabase'
import { redirect } from 'next/navigation'

export { TIER_ORDER, TIER_PERMISSIONS } from '@/lib/tiers'

export async function getSession() {
  const supabase = await createServerSupabaseClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) return null
  return session
}

export async function getUser() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !profile) return null
  return profile
}

export async function getSubscriptionTier(): Promise<SubscriptionTier> {
  const profile = await getProfile()
  if (!profile) return 'free'
  if (profile.subscription_status !== 'active' && profile.subscription_status !== 'trialing') {
    return 'free'
  }
  return profile.subscription_tier ?? 'free'
}

export function tierIndex(tier: SubscriptionTier): number {
  const { TIER_ORDER } = require('@/lib/tiers')
  return TIER_ORDER.indexOf(tier)
}

export function tierAtLeast(userTier: SubscriptionTier, requiredTier: SubscriptionTier): boolean {
  return tierIndex(userTier) >= tierIndex(requiredTier)
}

export function getTierPermissions(tier: SubscriptionTier) {
  const { TIER_PERMISSIONS } = require('@/lib/tiers')
  return TIER_PERMISSIONS[tier]
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) redirect('/login')
  return user
}

export async function requireTier(minimumTier: SubscriptionTier) {
  const user = await requireAuth()
  const tier = await getSubscriptionTier()
  if (!tierAtLeast(tier, minimumTier)) {
    redirect(`/upgrade?required=${minimumTier}`)
  }
  return { user, tier }
}

export async function requireAdmin() {
  const user = await requireAuth()
  const profile = await getProfile()
  if (!profile?.is_admin) {
    redirect('/dashboard')
  }
  return { user, profile }
}

export async function requireEditor() {
  const user = await requireAuth()
  const profile = await getProfile()
  if (!profile?.is_editor) {
    redirect('/dashboard')
  }
  return { user, profile }
}

export async function isAdmin(): Promise<boolean> {
  const profile = await getProfile()
  return profile?.is_admin ?? false
}

export async function isEditor(): Promise<boolean> {
  const profile = await getProfile()
  return profile?.is_editor ?? false
}

export async function signOut() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect('/')
}