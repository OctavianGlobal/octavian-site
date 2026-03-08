// ============================================================
// Octavian Global — Supabase Database Types
// ============================================================

export type SubscriptionTier =
  | 'free'
  | 'signal_watch'
  | 'signal_plus'
  | 'analyst'
  | 'analyst_pro'
  | 'institutional'
  | 'private_briefing'

export type SignalStatus = 'draft' | 'published' | 'archived'
export type SignalDomain = 'POWER' | 'MONEY' | 'RULES'
export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical'
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive' | null

export interface Database {
  public: {
    Tables: {
      sources: {
        Row: {
          id: string
          name: string
          url: string
          feed_url: string | null
          is_primary_source: boolean
          tier: number
          active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['sources']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['sources']['Insert']>
      }
      items: {
        Row: {
          id: string
          source_id: string
          title: string
          url: string
          content: string | null
          published_at: string
          hash: string
          processed: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['items']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['items']['Insert']>
      }
      entities: {
        Row: {
          id: string
          name: string
          type: 'country' | 'organization' | 'company' | 'commodity' | 'technology' | 'person'
          aliases: string[]
          active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['entities']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['entities']['Insert']>
      }
      tags: {
        Row: {
          id: string
          name: string
          domain: SignalDomain
          category: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['tags']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['tags']['Insert']>
      }
      clusters: {
        Row: {
          id: string
          label: string
          summary: string | null
          entity_ids: string[]
          tag_ids: string[]
          domain: SignalDomain
          started_at: string
          updated_at: string
          item_count: number
        }
        Insert: Omit<Database['public']['Tables']['clusters']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['clusters']['Insert']>
      }
      cluster_scores: {
        Row: {
          id: string
          cluster_id: string
          score: number
          confidence: number
          velocity: number
          source_diversity: number
          impact_label: ImpactLevel
          scored_at: string
        }
        Insert: Omit<Database['public']['Tables']['cluster_scores']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['cluster_scores']['Insert']>
      }
      signals: {
        Row: {
          id: string
          cluster_id: string | null
          title: string
          slug: string
          domain: SignalDomain
          summary: string
          body: string
          thesis: string
          indicators: string[]
          implications: string[]
          watch_list: string[]
          impact: ImpactLevel
          score: number | null
          confidence: number | null
          status: SignalStatus
          published_at: string | null
          archived_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['signals']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['signals']['Insert']>
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          domain: SignalDomain
          description: string | null
          signal_count: number
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          subscription_tier: SubscriptionTier
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: SubscriptionStatus
          is_admin: boolean
          is_editor: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      contact_submissions: {
        Row: {
          id: string
          name: string
          email: string
          organization: string | null
          inquiry_type: string
          message: string
          responded: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['contact_submissions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['contact_submissions']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_tier: SubscriptionTier
      signal_status: SignalStatus
      signal_domain: SignalDomain
      impact_level: ImpactLevel
    }
  }
}

// ============================================================
// Convenience row types
// ============================================================
export type Signal = Database['public']['Tables']['signals']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ClusterScore = Database['public']['Tables']['cluster_scores']['Row']
export type Entity = Database['public']['Tables']['entities']['Row']

export type SignalWithCategory = Signal & {
  categories?: Category[]
}

export type SignalPublic = Omit<Signal, 'score' | 'confidence'> & {
  score: number | null
  confidence: number | null
}