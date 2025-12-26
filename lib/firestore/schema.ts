/**
 * Firestore Schema Types for the "Nervous System"
 * Partner Architecture + System Audit Logs + Subscription Tiers
 */

import { Timestamp } from 'firebase/firestore';

// ==========================================
// SUBSCRIPTION TIER SYSTEM
// ==========================================

// Client/User Tiers
export type ClientTier = 'access' | 'starter' | 'pro' | 'enterprise';

// Partner/Provider Tiers (Garage to Global)
export type PartnerTier = 'garage' | 'toolkit' | 'community' | 'global';

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';

export interface SubscriptionData {
  // Core subscription info
  subscription_tier: ClientTier | PartnerTier;
  subscription_status: SubscriptionStatus;
  subscription_id: string | null; // Stripe subscription ID
  
  // Billing
  current_period_start: Timestamp | null;
  current_period_end: Timestamp | null;
  cancel_at_period_end: boolean;
  
  // Tier-specific features
  tier_features: TierFeatures;
}

export interface TierFeatures {
  // Shared features
  ai_queries_per_day: number;
  ai_query_reset_at: Timestamp | null;
  voice_enabled: boolean;
  priority_support: boolean;
  
  // Client-specific
  saved_professionals_limit?: number;
  booking_history_days?: number;
  
  // Partner-specific
  profile_visibility?: 'local' | 'regional' | 'global';
  portfolio_items_limit?: number;
  can_receive_enterprise?: boolean;
  commission_rate?: number; // 0.15 = 15%
}

// Stripe Price IDs for each tier (production)
export const STRIPE_PRICE_IDS = {
  client: {
    access: 'price_free', // Free tier
    starter: 'price_1RQ5ggxxxxxxSTARTER',
    pro: 'price_1RQ5ggxxxxxxPRO',
    enterprise: 'price_1RQ5ggxxxxxxENTERPRISE',
  },
  partner: {
    garage: 'price_free', // Free tier
    toolkit: 'price_1RQ5ggxxxxxxTOOLKIT',
    community: 'price_1RQ5ggxxxxxxCOMMUNITY',
    global: 'price_1RQ5ggxxxxxxGLOBAL',
  },
} as const;

// Default tier features
export const DEFAULT_TIER_FEATURES: Record<ClientTier | PartnerTier, TierFeatures> = {
  // Client Tiers
  access: {
    ai_queries_per_day: 5,
    ai_query_reset_at: null,
    voice_enabled: false,
    priority_support: false,
    saved_professionals_limit: 3,
    booking_history_days: 7,
  },
  starter: {
    ai_queries_per_day: 25,
    ai_query_reset_at: null,
    voice_enabled: true,
    priority_support: false,
    saved_professionals_limit: 10,
    booking_history_days: 30,
  },
  pro: {
    ai_queries_per_day: 100,
    ai_query_reset_at: null,
    voice_enabled: true,
    priority_support: true,
    saved_professionals_limit: 50,
    booking_history_days: 365,
  },
  enterprise: {
    ai_queries_per_day: -1, // Unlimited
    ai_query_reset_at: null,
    voice_enabled: true,
    priority_support: true,
    saved_professionals_limit: -1, // Unlimited
    booking_history_days: -1, // Unlimited
  },
  
  // Partner Tiers
  garage: {
    ai_queries_per_day: 10,
    ai_query_reset_at: null,
    voice_enabled: false,
    priority_support: false,
    profile_visibility: 'local',
    portfolio_items_limit: 3,
    can_receive_enterprise: false,
    commission_rate: 0.15,
  },
  toolkit: {
    ai_queries_per_day: 50,
    ai_query_reset_at: null,
    voice_enabled: true,
    priority_support: false,
    profile_visibility: 'regional',
    portfolio_items_limit: 10,
    can_receive_enterprise: false,
    commission_rate: 0.12,
  },
  community: {
    ai_queries_per_day: 200,
    ai_query_reset_at: null,
    voice_enabled: true,
    priority_support: true,
    profile_visibility: 'regional',
    portfolio_items_limit: 25,
    can_receive_enterprise: true,
    commission_rate: 0.10,
  },
  global: {
    ai_queries_per_day: -1, // Unlimited
    ai_query_reset_at: null,
    voice_enabled: true,
    priority_support: true,
    profile_visibility: 'global',
    portfolio_items_limit: -1, // Unlimited
    can_receive_enterprise: true,
    commission_rate: 0.05,
  },
};

// ==========================================
// PARTNER/AFFILIATE ARCHITECTURE
// ==========================================

export interface PartnerProfile {
  // Core fields (extend existing Profile)
  affiliate_code: string | null;      // Unique code for partner referrals
  parent_partner_id: string | null;   // Reference to the partner who referred this user
  commission_rate_override: number | null; // Custom commission rate (default: 0.15 = 15%)
  stripe_connect_id: string | null;   // For receiving payouts
  
  // Partner tier progression
  partner_tier: 'none' | 'bronze' | 'silver' | 'gold';
  total_referrals: number;
  total_earnings_cents: number;
}

// Default partner fields for new profiles
export const DEFAULT_PARTNER_FIELDS: PartnerProfile = {
  affiliate_code: null,
  parent_partner_id: null,
  commission_rate_override: null,
  stripe_connect_id: null,
  partner_tier: 'none',
  total_referrals: 0,
  total_earnings_cents: 0,
};

// ==========================================
// SYSTEM AUDIT LOGS (Nervous System Memory)
// ==========================================

export type LogSeverity = 'debug' | 'info' | 'warn' | 'error' | 'critical';
export type LogSource = 'stripe' | 'auth' | 'admin' | 'verification' | 'ai' | 'system';

export interface SystemLog {
  id?: string;
  event_type: string;
  source: LogSource;
  severity: LogSeverity;
  payload: Record<string, any>;
  user_id?: string;
  created_at: Timestamp;
}

// ==========================================
// BOOKING WITH FINANCIAL SPLIT DATA
// ==========================================

export interface BookingFinancials {
  total_cents: number;           // What the client pays
  platform_fee_cents: number;    // Platform's cut
  expert_share_cents: number;    // What the NURD receives
  partner_share_cents: number;   // 15% of platform fee to affiliate
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  payout_status: 'pending' | 'processing' | 'completed' | 'failed';
}

// ==========================================
// VERIFICATION STATUS (Ballerine Integration)
// ==========================================

export type VerificationLevel = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface VerificationData {
  verification_status: VerificationLevel;
  verification_id: string | null;
  verified_at: Timestamp | null;
  verification_provider: 'ballerine' | 'manual';
  verification_documents: string[]; // Cloud Storage paths
}

// ==========================================
// CONCIERGE AI CONTEXT
// ==========================================

export interface ConciergeQuery {
  query: string;
  user_id?: string;
  context: {
    current_page: string;
    user_role?: 'client' | 'nurd' | 'partner' | 'admin';
    location?: string;
  };
}

export interface ConciergeResponse {
  response: string;
  suggested_actions: Array<{
    type: 'search' | 'navigate' | 'calculate';
    label: string;
    payload: any;
  }>;
  related_categories?: string[];
  related_professionals?: string[];
}

// --- NERVOUS SYSTEM (AGENTS) ---

export interface AgentState {
  id: string; // e.g., 'finder-ang', 'acheevy-core'
  name: string;
  role: 'orchestrator' | 'finder' | 'maker' | 'debugger' | 'visualizer';
  status: 'active' | 'idle' | 'busy' | 'offline' | 'error';
  current_task_id?: string;
  last_heartbeat: string; // ISO date
  capabilities: string[];
  metrics: {
    tasks_completed: number;
    uptime_seconds: number;
    error_count: number;
  };
}

export interface AgentTask {
  id: string;
  type: string; // e.g., 'research_request', 'code_generation'
  target_agent_id?: string; // If null, Orchestrator delegates
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  payload: any; // The input data (prompt, constraints)
  result?: any; // The output data
  error?: string;
  created_by: string; // User ID or System
  created_at: string;
  started_at?: string;
  completed_at?: string;
  logs: string[]; // Progression logs for the UI
}

export interface SystemBreaker {
  id: string;
  name: string;
  category: 'core' | 'external' | 'financial';
  is_active: boolean; // TRUE = Circuit Closed (Working), FALSE = Open (Broken/Off)
  load_percentage: number;
  last_trip?: string;
}
