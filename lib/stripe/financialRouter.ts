/**
 * Financial Router - Stripe Payment Split Logic
 * 
 * This module handles the 3-way split for marketplace transactions:
 * - Expert (NURD): Receives net amount after platform fee
 * - Partner: Receives 15% of platform fee (if referral exists)
 * - Platform: Retains remaining platform fee
 * 
 * Designed for deployment on Cloud Run / Cloud Functions
 */

// This would use the Stripe SDK in a Cloud Run environment
// For client-side, we define the types and API client

export interface BookingPaymentData {
  booking_id: string;
  total_cents: number;
  platform_fee_cents: number;
  expert_id: string;
  expert_stripe_connect_id: string;
  partner_id?: string;
  partner_stripe_connect_id?: string;
  commission_rate_override?: number;
}

export interface PaymentSplitResult {
  expert_share_cents: number;
  partner_share_cents: number;
  platform_share_cents: number;
  stripe_transfer_ids: {
    expert?: string;
    partner?: string;
  };
}

/**
 * Calculate the payment split for a booking
 */
export function calculatePaymentSplit(
  totalCents: number,
  platformFeeCents: number,
  commissionRateOverride?: number
): {
  expertShare: number;
  partnerShare: number;
  platformShare: number;
} {
  // Default partner commission: 15% of platform fee
  const partnerRate = commissionRateOverride ?? 0.15;
  
  // Expert gets everything minus platform fee
  const expertShare = totalCents - platformFeeCents;
  
  // Partner gets percentage of platform fee
  const partnerShare = Math.floor(platformFeeCents * partnerRate);
  
  // Platform keeps the rest
  const platformShare = platformFeeCents - partnerShare;
  
  return {
    expertShare,
    partnerShare,
    platformShare,
  };
}

/**
 * Client-side function to create a checkout session
 * Calls the Cloud Run backend
 */
export async function createCheckoutSession(
  bookingId: string,
  totalCents: number,
  platformFeeCents: number,
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionId: string; url: string } | null> {
  try {
    const response = await fetch('/api/payments/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_id: bookingId,
        total_cents: totalCents,
        platform_fee_cents: platformFeeCents,
        success_url: successUrl,
        cancel_url: cancelUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    return await response.json();
  } catch (error) {
    console.error('[Payment] Checkout creation failed:', error);
    return null;
  }
}

/**
 * Format cents to display currency
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

/**
 * Calculate the platform fee based on expert tier
 */
export function calculatePlatformFee(
  totalCents: number,
  expertTier: 'garage' | 'community' | 'global'
): number {
  // Fee rates by tier (decreasing as experts level up)
  const feeRates: Record<string, number> = {
    garage: 0.15,     // 15% for new experts
    community: 0.10,  // 10% for verified experts
    global: 0.05,     // 5% for top-tier experts
  };
  
  const rate = feeRates[expertTier] || 0.15;
  return Math.floor(totalCents * rate);
}

/**
 * Display-ready breakdown of a booking's financials
 */
export interface BookingBreakdown {
  clientPays: string;
  platformFee: string;
  partnerCommission: string;
  expertReceives: string;
  platformNet: string;
}

export function getBookingBreakdown(
  totalCents: number,
  platformFeeCents: number,
  hasPartner: boolean = false,
  commissionRate: number = 0.15
): BookingBreakdown {
  const split = calculatePaymentSplit(totalCents, platformFeeCents, hasPartner ? commissionRate : 0);
  
  return {
    clientPays: formatCurrency(totalCents),
    platformFee: formatCurrency(platformFeeCents),
    partnerCommission: hasPartner ? formatCurrency(split.partnerShare) : '$0.00',
    expertReceives: formatCurrency(split.expertShare),
    platformNet: formatCurrency(split.platformShare),
  };
}
