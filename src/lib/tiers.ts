import type { SubscriptionTier } from '@/types/supabase'

export const TIER_ORDER: SubscriptionTier[] = [
  'free',
  'signal',
  'signal_plus',
  'analyst',
  'editor',
]

export const TIER_PERMISSIONS: Record<SubscriptionTier, {
  canViewDomainScores: boolean
  canViewSignalScore: boolean
  canViewConfidence: boolean
  canSearchArchive: boolean
  canEditAndPublish: boolean
  archiveDaysBack: number | 'unlimited'
}> = {
  free: {
    canViewDomainScores: false,
    canViewSignalScore: false,
    canViewConfidence: false,
    canSearchArchive: false,
    canEditAndPublish: false,
    archiveDaysBack: 0,
  },
  signal: {
    canViewDomainScores: true,
    canViewSignalScore: false,
    canViewConfidence: false,
    canSearchArchive: false,
    canEditAndPublish: false,
    archiveDaysBack: 0,
  },
  signal_plus: {
    canViewDomainScores: true,
    canViewSignalScore: true,
    canViewConfidence: true,
    canSearchArchive: false,
    canEditAndPublish: false,
    archiveDaysBack: 0,
  },
  analyst: {
    canViewDomainScores: true,
    canViewSignalScore: true,
    canViewConfidence: true,
    canSearchArchive: true,
    canEditAndPublish: false,
    archiveDaysBack: 'unlimited',
  },
  editor: {
    canViewDomainScores: true,
    canViewSignalScore: true,
    canViewConfidence: true,
    canSearchArchive: true,
    canEditAndPublish: true,
    archiveDaysBack: 'unlimited',
  },
}