/**
 * Partner/Affiliate Management
 * Handles affiliate code generation, referral tracking, and commission calculations
 */

import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../gcp';
import { logger } from './logger';
import type { PartnerProfile, DEFAULT_PARTNER_FIELDS } from './schema';

const PROFILES_COLLECTION = 'profiles';

/**
 * Generate a unique affiliate code for a partner
 */
export function generateAffiliateCode(displayName: string): string {
  const sanitized = displayName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${sanitized}-${random}`;
}

/**
 * Activate partner status for a user
 */
export async function activatePartner(userId: string, displayName: string): Promise<string | null> {
  try {
    const affiliateCode = generateAffiliateCode(displayName);
    
    await updateDoc(doc(db, PROFILES_COLLECTION, userId), {
      affiliate_code: affiliateCode,
      partner_tier: 'bronze',
    });
    
    await logger.info('partner.activated', 'admin', { 
      affiliate_code: affiliateCode 
    }, userId);
    
    return affiliateCode;
  } catch (error) {
    console.error('[Partner] Failed to activate:', error);
    await logger.error('partner.activation_failed', 'admin', { error: String(error) }, userId);
    return null;
  }
}

/**
 * Link a new user to their referrer (via affiliate code)
 */
export async function linkToReferrer(
  newUserId: string, 
  affiliateCode: string
): Promise<boolean> {
  try {
    // Find the partner with this code
    const q = query(
      collection(db, PROFILES_COLLECTION),
      where('affiliate_code', '==', affiliateCode)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.warn('[Partner] Invalid affiliate code:', affiliateCode);
      return false;
    }
    
    const partnerId = snapshot.docs[0].id;
    
    // Link the new user to the partner
    await updateDoc(doc(db, PROFILES_COLLECTION, newUserId), {
      parent_partner_id: partnerId,
    });
    
    // Increment partner's referral count
    const partnerDoc = await getDoc(doc(db, PROFILES_COLLECTION, partnerId));
    const currentReferrals = partnerDoc.data()?.total_referrals || 0;
    
    await updateDoc(doc(db, PROFILES_COLLECTION, partnerId), {
      total_referrals: currentReferrals + 1,
    });
    
    await logger.info('partner.referral_linked', 'admin', {
      partner_id: partnerId,
      affiliate_code: affiliateCode,
    }, newUserId);
    
    return true;
  } catch (error) {
    console.error('[Partner] Failed to link referrer:', error);
    return false;
  }
}

/**
 * Calculate partner commission from a booking
 * Returns the amount in cents
 */
export function calculatePartnerCommission(
  platformFeeCents: number,
  commissionRateOverride?: number | null
): number {
  const rate = commissionRateOverride ?? 0.15; // Default 15%
  return Math.floor(platformFeeCents * rate);
}

/**
 * Record a commission payout for a partner
 */
export async function recordCommissionPayout(
  partnerId: string,
  amountCents: number,
  bookingId: string
): Promise<void> {
  try {
    const partnerDoc = await getDoc(doc(db, PROFILES_COLLECTION, partnerId));
    const currentEarnings = partnerDoc.data()?.total_earnings_cents || 0;
    
    await updateDoc(doc(db, PROFILES_COLLECTION, partnerId), {
      total_earnings_cents: currentEarnings + amountCents,
    });
    
    await logger.info('partner.commission_paid', 'stripe', {
      amount_cents: amountCents,
      booking_id: bookingId,
    }, partnerId);
    
    // Check for tier upgrades
    const newTotal = currentEarnings + amountCents;
    await checkTierUpgrade(partnerId, newTotal);
  } catch (error) {
    console.error('[Partner] Failed to record payout:', error);
    await logger.error('partner.payout_failed', 'stripe', { 
      error: String(error),
      booking_id: bookingId,
    }, partnerId);
  }
}

/**
 * Check and apply tier upgrades based on earnings
 */
async function checkTierUpgrade(partnerId: string, totalEarningsCents: number): Promise<void> {
  // Tier thresholds (in cents)
  const SILVER_THRESHOLD = 50000;   // $500
  const GOLD_THRESHOLD = 250000;    // $2,500
  
  let newTier: 'bronze' | 'silver' | 'gold' = 'bronze';
  
  if (totalEarningsCents >= GOLD_THRESHOLD) {
    newTier = 'gold';
  } else if (totalEarningsCents >= SILVER_THRESHOLD) {
    newTier = 'silver';
  }
  
  const partnerDoc = await getDoc(doc(db, PROFILES_COLLECTION, partnerId));
  const currentTier = partnerDoc.data()?.partner_tier;
  
  if (newTier !== currentTier && newTier !== 'bronze') {
    await updateDoc(doc(db, PROFILES_COLLECTION, partnerId), {
      partner_tier: newTier,
    });
    
    await logger.info('partner.tier_upgrade', 'admin', {
      previous_tier: currentTier,
      new_tier: newTier,
      total_earnings_cents: totalEarningsCents,
    }, partnerId);
  }
}

/**
 * Get partner stats for dashboard
 */
export async function getPartnerStats(partnerId: string): Promise<{
  tier: string;
  affiliateCode: string | null;
  totalReferrals: number;
  totalEarnings: number;
} | null> {
  try {
    const partnerDoc = await getDoc(doc(db, PROFILES_COLLECTION, partnerId));
    const data = partnerDoc.data();
    
    if (!data) return null;
    
    return {
      tier: data.partner_tier || 'none',
      affiliateCode: data.affiliate_code || null,
      totalReferrals: data.total_referrals || 0,
      totalEarnings: (data.total_earnings_cents || 0) / 100,
    };
  } catch (error) {
    console.error('[Partner] Failed to get stats:', error);
    return null;
  }
}
