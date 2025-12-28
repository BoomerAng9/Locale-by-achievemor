/**
 * Subscription Service
 * Handles tier management, feature access, and Stripe subscription webhooks
 * 
 * Schema: users/{userId}/subscription
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../gcp';
import { 
  SubscriptionData, 
  SubscriptionStatus, 
  ClientTier, 
  PartnerTier,
  TierFeatures,
  DEFAULT_TIER_FEATURES,
  STRIPE_PRICE_IDS,
} from '../firestore/schema';

// ==========================================
// TYPES
// ==========================================

export type UserType = 'client' | 'partner';

export interface SubscriptionInfo extends SubscriptionData {
  userId: string;
  userType: UserType;
  canUpgrade: boolean;
  upgradePath: string[];
}

// ==========================================
// TIER HIERARCHY
// ==========================================

const CLIENT_TIER_ORDER: readonly ClientTier[] = ['access', 'starter', 'pro', 'enterprise'] as const;
const PARTNER_TIER_ORDER: readonly PartnerTier[] = ['garage', 'toolkit', 'community', 'global'] as const;

// ==========================================
// CORE FUNCTIONS
// ==========================================

/**
 * Get user's current subscription data
 */
export async function getUserSubscription(userId: string): Promise<SubscriptionInfo | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();
    const subscription = userData.subscription as SubscriptionData | undefined;
    const userType: UserType = userData.role === 'partner' || userData.role === 'nurd' ? 'partner' : 'client';
    
    // Default to free tier if no subscription
    if (!subscription) {
      return {
        userId,
        userType,
        subscription_tier: userType === 'partner' ? 'garage' : 'access',
        subscription_status: 'active',
        subscription_id: null,
        current_period_start: null,
        current_period_end: null,
        cancel_at_period_end: false,
        tier_features: DEFAULT_TIER_FEATURES[userType === 'partner' ? 'garage' : 'access'],
        canUpgrade: true,
        upgradePath: userType === 'partner' 
          ? ['toolkit', 'community', 'global']
          : ['starter', 'pro', 'enterprise'],
      };
    }

    const tierOrder = userType === 'partner' ? PARTNER_TIER_ORDER : CLIENT_TIER_ORDER;
    const currentIndex = (tierOrder as readonly string[]).indexOf(subscription.subscription_tier);
    const upgradePath = tierOrder.slice(currentIndex + 1);

    return {
      ...subscription,
      userId,
      userType,
      canUpgrade: upgradePath.length > 0,
      upgradePath,
    };
  } catch (error) {
    console.error('Failed to get subscription:', error);
    return null;
  }
}

/**
 * Initialize subscription for a new user
 */
export async function initializeSubscription(
  userId: string, 
  userType: UserType = 'client'
): Promise<void> {
  const freeTier = userType === 'partner' ? 'garage' : 'access';
  
  const subscription: SubscriptionData = {
    subscription_tier: freeTier,
    subscription_status: 'active',
    subscription_id: null,
    current_period_start: null,
    current_period_end: null,
    cancel_at_period_end: false,
    tier_features: DEFAULT_TIER_FEATURES[freeTier],
  };

  await setDoc(doc(db, 'users', userId), {
    subscription,
    role: userType,
    updated_at: serverTimestamp(),
  }, { merge: true });
}

/**
 * Update subscription after Stripe webhook
 */
export async function updateSubscriptionFromStripe(
  userId: string,
  stripeSubscriptionId: string,
  status: SubscriptionStatus,
  tier: ClientTier | PartnerTier,
  periodStart: Date,
  periodEnd: Date,
  cancelAtPeriodEnd: boolean = false
): Promise<void> {
  const subscription: SubscriptionData = {
    subscription_tier: tier,
    subscription_status: status,
    subscription_id: stripeSubscriptionId,
    current_period_start: Timestamp.fromDate(periodStart),
    current_period_end: Timestamp.fromDate(periodEnd),
    cancel_at_period_end: cancelAtPeriodEnd,
    tier_features: DEFAULT_TIER_FEATURES[tier],
  };

  await updateDoc(doc(db, 'users', userId), {
    subscription,
    updated_at: serverTimestamp(),
  });
}

/**
 * Check if user has access to a specific feature
 */
export async function checkFeatureAccess(
  userId: string,
  feature: keyof TierFeatures
): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  
  if (!subscription) {
    return false;
  }

  const value = subscription.tier_features[feature];
  
  // -1 means unlimited
  if (typeof value === 'number') {
    return value !== 0;
  }
  
  return Boolean(value);
}

/**
 * Check and decrement AI query count
 */
export async function checkAndDecrementAIQueries(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetsAt: Date | null;
}> {
  const subscription = await getUserSubscription(userId);
  
  if (!subscription) {
    return { allowed: false, remaining: 0, resetsAt: null };
  }

  const { ai_queries_per_day, ai_query_reset_at } = subscription.tier_features;
  
  // Unlimited
  if (ai_queries_per_day === -1) {
    return { allowed: true, remaining: -1, resetsAt: null };
  }

  const now = new Date();
  const resetAt = ai_query_reset_at?.toDate() || null;
  
  // Check if we need to reset the counter
  if (!resetAt || now >= resetAt) {
    // Reset to full quota and set new reset time
    const newResetAt = new Date(now);
    newResetAt.setDate(newResetAt.getDate() + 1);
    newResetAt.setHours(0, 0, 0, 0);

    await updateDoc(doc(db, 'users', userId), {
      'subscription.tier_features.ai_queries_remaining': ai_queries_per_day - 1,
      'subscription.tier_features.ai_query_reset_at': Timestamp.fromDate(newResetAt),
    });

    return { 
      allowed: true, 
      remaining: ai_queries_per_day - 1, 
      resetsAt: newResetAt 
    };
  }

  // Get current remaining count
  const userDoc = await getDoc(doc(db, 'users', userId));
  const remaining = userDoc.data()?.subscription?.tier_features?.ai_queries_remaining ?? ai_queries_per_day;

  if (remaining <= 0) {
    return { allowed: false, remaining: 0, resetsAt: resetAt };
  }

  // Decrement
  await updateDoc(doc(db, 'users', userId), {
    'subscription.tier_features.ai_queries_remaining': remaining - 1,
  });

  return { 
    allowed: true, 
    remaining: remaining - 1, 
    resetsAt: resetAt 
  };
}

/**
 * Get upgrade options for a user
 */
export function getUpgradeOptions(
  currentTier: ClientTier | PartnerTier,
  userType: UserType
): Array<{ tier: ClientTier | PartnerTier; priceId: string; features: TierFeatures }> {
  const tierOrder = userType === 'partner' ? PARTNER_TIER_ORDER : CLIENT_TIER_ORDER;
  const priceIds = userType === 'partner' ? STRIPE_PRICE_IDS.partner : STRIPE_PRICE_IDS.client;
  
  const currentIndex = (tierOrder as readonly string[]).indexOf(currentTier);
  
  return tierOrder
    .slice(currentIndex + 1)
    .map(tier => ({
      tier,
      priceId: priceIds[tier as keyof typeof priceIds],
      features: DEFAULT_TIER_FEATURES[tier],
    }));
}

/**
 * Map Stripe price ID to tier
 */
export function priceIdToTier(priceId: string): ClientTier | PartnerTier | null {
  // Check client tiers
  for (const [tier, id] of Object.entries(STRIPE_PRICE_IDS.client)) {
    if (id === priceId) return tier as ClientTier;
  }
  
  // Check partner tiers
  for (const [tier, id] of Object.entries(STRIPE_PRICE_IDS.partner)) {
    if (id === priceId) return tier as PartnerTier;
  }
  
  return null;
}

// ==========================================
// EXPORTS
// ==========================================

export type {
  ClientTier,
  PartnerTier,
  SubscriptionStatus,
  TierFeatures,
};

export {
  DEFAULT_TIER_FEATURES,
  STRIPE_PRICE_IDS,
};
