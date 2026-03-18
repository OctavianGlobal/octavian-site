// ============================================================
// src/types/supabase.ts
// Octavian Global — Supabase Database Types
// Synced to real schema — March 2026
// ============================================================

export type SubscriptionTier =
  | 'free'
  | 'signal'
  | 'signal_plus'
  | 'analyst'
  | 'editor'

export type SignalStatus = 'candidate' | 'published' | 'archived'
export type SignalDomain = 'POWER' | 'MONEY' | 'RULES' | 'ENVIRONMENT' | 'TECHNOLOGY'
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'inactive' | null

export interface Database {
  public: {
    Tables: {
      sources: {
        Row: {
          id: string
          name: string
          type: string | null
          feed_url: string | null
          credibility_weight: number | null
          is_primary_source: boolean | null
        }
        Insert: Omit<Database['public']['Tables']['sources']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['sources']['Insert']>
      }
      items: {
        Row: {
          id: string
          source_id: string | null
          title: string | null
          url: string | null
          published_at: string | null
          fetched_at: string | null
          snippet: string | null
          raw_text: string | null
          raw_payload_jsonb: Record<string, unknown> | null
          hash: string | null
        }
        Insert: Omit<Database['public']['Tables']['items']['Row'], 'id' | 'fetched_at'>
        Update: Partial<Database['public']['Tables']['items']['Insert']>
      }
      entities: {
        Row: {
          id: string
          name: string
          type: string | null
          canonical_key: string | null
          created_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['entities']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['entities']['Insert']>
      }
      tags: {
        Row: {
          id: string
          name: string
          domain: SignalDomain
          taxonomy_version: string | null
          created_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['tags']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['tags']['Insert']>
      }
      item_entities: {
        Row: {
          item_id: string
          entity_id: string
          weight: number | null
        }
        Insert: Database['public']['Tables']['item_entities']['Row']
        Update: Partial<Database['public']['Tables']['item_entities']['Row']>
      }
      item_tags: {
        Row: {
          item_id: string
          tag_id: string
          weight: number | null
          ai_confidence: number | null
        }
        Insert: Database['public']['Tables']['item_tags']['Row']
        Update: Partial<Database['public']['Tables']['item_tags']['Row']>
      }
      clusters: {
        Row: {
          id: string
          cluster_key: string | null
          first_seen_at: string | null
          last_seen_at: string | null
          cluster_summary: string | null
          top_entities_jsonb: string[] | null
          top_tags_jsonb: string[] | null
          primary_domain: SignalDomain | null   // Added via migration 001
          domains_jsonb: SignalDomain[] | null   // Added via migration 002 — all domains present
          cluster_embedding: unknown | null
          created_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['clusters']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['clusters']['Insert']>
      }
      cluster_items: {
        Row: {
          cluster_id: string
          item_id: string
        }
        Insert: Database['public']['Tables']['cluster_items']['Row']
        Update: Partial<Database['public']['Tables']['cluster_items']['Row']>
      }
      cluster_scores: {
        Row: {
          cluster_id: string
          power_score: number | null
          money_score: number | null
          rules_score: number | null
          severity_score: number | null
          impact_score: number | null
          credibility_score: number | null
          corroboration_score: number | null
          evidence_score: number | null
          raw_novelty: number | null
          data_maturity: number | null
          novelty_score: number | null
          freq_anomaly: number | null
          sev_anomaly: number | null
          anomaly_score: number | null
          severity_modifier: number | null
          signal_score_raw: number | null       // Master signal score 0.0–1.0
          ai_confidence: number | null
          scored_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['cluster_scores']['Row'], 'scored_at'>
        Update: Partial<Database['public']['Tables']['cluster_scores']['Insert']>
      }
      signals: {
        Row: {
          id: string
          cluster_id: string | null
          status: SignalStatus
          reviewed_at: string | null
          published_at: string | null
          published_title: string | null
          published_body_md: string | null
          created_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['signals']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['signals']['Insert']>
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
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      baseline_tag_daily: {
        Row: {
          tag_id: string
          window_date: string
          count_7d: number | null
          mean_7d: number | null
          std_7d: number | null
          count_30d: number | null
          mean_30d: number | null
          std_30d: number | null
        }
        Insert: Database['public']['Tables']['baseline_tag_daily']['Row']
        Update: Partial<Database['public']['Tables']['baseline_tag_daily']['Row']>
      }
      baseline_entity_tag_monthly: {
        Row: {
          entity_id: string
          tag_id: string
          month: string
          event_count: number | null
        }
        Insert: Database['public']['Tables']['baseline_entity_tag_monthly']['Row']
        Update: Partial<Database['public']['Tables']['baseline_entity_tag_monthly']['Row']>
      }
      baseline_entity_pair_yearly: {
        Row: {
          entity_id_a: string
          entity_id_b: string
          year: number
          co_occurrence_count: number | null
        }
        Insert: Database['public']['Tables']['baseline_entity_pair_yearly']['Row']
        Update: Partial<Database['public']['Tables']['baseline_entity_pair_yearly']['Row']>
      }
    }
    Views: {
      source_health_dashboard: {
        Row: {
          name: string | null
          is_active: boolean | null
          last_health: string | null
          last_http_status: number | null
          last_entries_count: number | null
          last_checked_at: string | null
          status_group: string | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// ============================================================
// Convenience row types
// ============================================================
export type Signal        = Database['public']['Tables']['signals']['Row']
export type Cluster       = Database['public']['Tables']['clusters']['Row']
export type ClusterScore  = Database['public']['Tables']['cluster_scores']['Row']
export type Entity        = Database['public']['Tables']['entities']['Row']
export type Tag           = Database['public']['Tables']['tags']['Row']
export type Profile       = Database['public']['Tables']['profiles']['Row']
export type Item          = Database['public']['Tables']['items']['Row']

// ── Dashboard / query shape ───────────────────────────────────────────────────
// What getDashboardData returns per signal row (joined from signals + clusters + cluster_scores)
export interface DashboardSignal {
  id: string
  status: SignalStatus
  created_at: string | null
  cluster_id: string | null
primary_published_at: string | null
primary_fetched_at: string | null
primary_item_age: number | null

  // From clusters join
  cluster_summary: string | null
  primary_domain: SignalDomain | null
  domains_jsonb: SignalDomain[] | null
  top_entities_jsonb: string[] | null
  top_tags_jsonb: string[] | null
  // From cluster_scores join
  signal_score_raw: number | null
  power_score: number | null
  money_score: number | null
  rules_score: number | null
  ai_confidence: number | null
  // Resolved at query time (tier-gated)
  score: number | null
  confidence: number | null
  // To display in signal queue cards
  primary_snippet: string | null
  primary_source_name: string | null
}

// ── Public-facing signal (published briefs) ───────────────────────────────────
export interface PublishedSignal {
  id: string
  cluster_id: string | null
  status: SignalStatus
  published_at: string | null
  published_title: string | null
  published_body_md: string | null
  created_at: string | null
  // Joined from cluster
  primary_domain: SignalDomain | null
  cluster_summary: string | null
  // Tier-gated
  score: number | null
  confidence: number | null
}

// Legacy alias — kept for any existing imports
export type SignalPublic = DashboardSignal