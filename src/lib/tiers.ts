import type { SubscriptionTier } from '@/types/supabase'

export const TIER_ORDER: SubscriptionTier[] = [
  'free',
  'signal_watch',
  'signal_plus',
  'analyst',
  'analyst_pro',
  'institutional',
  'private_briefing',
]

export const TIER_PERMISSIONS: Record<SubscriptionTier, {
  canViewScores: boolean
  canSearchArchive: boolean
  canViewConfidence: boolean
  canAccessAPI: boolean
  canAccessPrivateBriefing: boolean
  archiveDaysBack: number | 'unlimited'
}> = {
  free: {
    canViewScores: false,
    canSearchArchive: false,
    canViewConfidence: false,
    canAccessAPI: false,
    canAccessPrivateBriefing: false,
    archiveDaysBack: 30,
  },
  signal_watch: {
    canViewScores: false,
    canSearchArchive: true,
    canViewConfidence: false,
    canAccessAPI: false,
    canAccessPrivateBriefing: false,
    archiveDaysBack: 90,
  },
  signal_plus: {
    canViewScores: true,
    canSearchArchive: true,
    canViewConfidence: false,
    canAccessAPI: false,
    canAccessPrivateBriefing: false,
    archiveDaysBack: 180,
  },
  analyst: {
    canViewScores: true,
    canSearchArchive: true,
    canViewConfidence: true,
    canAccessAPI: false,
    canAccessPrivateBriefing: false,
    archiveDaysBack: 'unlimited',
  },
  analyst_pro: {
    canViewScores: true,
    canSearchArchive: true,
    canViewConfidence: true,
    canAccessAPI: false,
    canAccessPrivateBriefing: false,
    archiveDaysBack: 'unlimited',
  },
  institutional: {
    canViewScores: true,
    canSearchArchive: true,
    canViewConfidence: true,
    canAccessAPI: true,
    canAccessPrivateBriefing: false,
    archiveDaysBack: 'unlimited',
  },
  private_briefing: {
    canViewScores: true,
    canSearchArchive: true,
    canViewConfidence: true,
    canAccessAPI: true,
    canAccessPrivateBriefing: true,
    archiveDaysBack: 'unlimited',
  },
}