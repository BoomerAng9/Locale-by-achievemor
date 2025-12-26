/**
 * Locale by ACHIEVEMOR - Firebase Cloud Functions
 * The "Nervous System" - Payment Processing & Webhooks
 * 
 * This serverless backend handles:
 * - Stripe webhook events
 * - Payment splits (Expert/Partner)
 * - Firestore booking updates
 * 
 * Environment Configuration:
 * All secrets are loaded from Firebase Functions config or .env
 * Set with: firebase functions:config:set stripe.secret="sk_..." stripe.webhook="whsec_..."
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// ============================================
// ENVIRONMENT CONFIGURATION
// ============================================

interface Config {
  stripe: {
    secret: string;
    webhook: string;
  };
  platform: {
    feePercent: number;
    partnerCommissionPercent: number;
  };
}

/**
 * Get configuration from Firebase Functions config or environment
 * Supports both Firebase config and .env fallback
 */
function getConfig(): Config {
  const functionsConfig = functions.config();
  
  return {
    stripe: {
      secret: functionsConfig.stripe?.secret || process.env.STRIPE_SECRET_KEY || "",
      webhook: functionsConfig.stripe?.webhook || process.env.STRIPE_WEBHOOK_SECRET || "",
    },
    platform: {
      feePercent: parseFloat(functionsConfig.platform?.fee_percent || process.env.PLATFORM_FEE_PERCENT || "0.12"),
      partnerCommissionPercent: parseFloat(functionsConfig.platform?.partner_commission || process.env.PARTNER_COMMISSION_PERCENT || "0.15"),
    },
  };
}

/**
 * Initialize Stripe with config-based secret key
 */
function getStripe(): Stripe {
  const config = getConfig();
  if (!config.stripe.secret) {
    throw new Error("Stripe secret key not configured. Set via: firebase functions:config:set stripe.secret=\"sk_...\"");
  }
  return new Stripe(config.stripe.secret, { apiVersion: "2023-10-16" });
}

// ============================================
// STRIPE WEBHOOK HANDLER
// ============================================
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const config = getConfig();
  const sig = req.headers["stripe-signature"] as string;

  if (!config.stripe.webhook) {
    console.error("Stripe webhook secret not configured");
    res.status(500).send("Webhook secret not configured");
    return;
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.rawBody, sig, config.stripe.webhook);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  console.log(`Received Stripe event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;

      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "transfer.created":
        console.log("Transfer created:", (event.data.object as Stripe.Transfer).id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true, type: event.type });
  } catch (err: any) {
    console.error(`Error processing webhook: ${err.message}`);
    res.status(500).send(`Webhook processing error: ${err.message}`);
  }
});

// ============================================
// PAYMENT PROCESSING HANDLERS
// ============================================

async function handleCheckoutComplete(session: Stripe.Checkout.Session): Promise<void> {
  const bookingId = session.metadata?.bookingId;

  if (!bookingId) {
    console.log("No bookingId in session metadata, skipping");
    return;
  }

  console.log(`Processing checkout for booking: ${bookingId}`);

  const bookingRef = db.collection("bookings").doc(bookingId);
  const bookingSnap = await bookingRef.get();

  if (!bookingSnap.exists) {
    console.error(`Booking ${bookingId} not found in Firestore`);
    return;
  }

  const bookingData = bookingSnap.data() as BookingData;
  await executeFinancialSplit(session, bookingData, bookingRef);
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const bookingId = paymentIntent.metadata?.bookingId;

  if (!bookingId) {
    console.log("No bookingId in payment intent metadata");
    return;
  }

  console.log(`Payment succeeded for booking: ${bookingId}`);

  const bookingRef = db.collection("bookings").doc(bookingId);
  await bookingRef.update({
    paymentIntentId: paymentIntent.id,
    paymentStatus: "succeeded",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

// ============================================
// FINANCIAL ROUTER - CONFIGURABLE SPLIT LOGIC
// ============================================

interface BookingData {
  totalCents: number;
  platformFeeCents: number;
  expertStripeId?: string;
  partnerStripeId?: string;
  expertId?: string;
  partnerId?: string;
  serviceType?: string;
}

/**
 * Execute the financial split between platform, expert, and partner
 * Uses configurable percentages from environment
 */
async function executeFinancialSplit(
  session: Stripe.Checkout.Session,
  bookingData: BookingData,
  bookingRef: admin.firestore.DocumentReference
): Promise<void> {
  const stripe = getStripe();
  const config = getConfig();

  const totalCents = bookingData.totalCents || (session.amount_total ?? 0);
  
  // Use configurable percentages
  const platformFeeCents = Math.floor(totalCents * config.platform.feePercent);
  const partnerPayoutCents = bookingData.partnerStripeId 
    ? Math.floor(platformFeeCents * config.platform.partnerCommissionPercent) 
    : 0;
  const expertPayoutCents = totalCents - platformFeeCents;

  console.log(`Financial Split (${config.platform.feePercent * 100}% platform, ${config.platform.partnerCommissionPercent * 100}% partner):
    Total: $${(totalCents / 100).toFixed(2)}
    Platform Fee: $${(platformFeeCents / 100).toFixed(2)}
    Expert Payout: $${(expertPayoutCents / 100).toFixed(2)}
    Partner Commission: $${(partnerPayoutCents / 100).toFixed(2)}
  `);

  const paymentIntentId = session.                                                                                                            payment_intent as string;
  const transfers: { type: string; amount: number; destination: string; transferId?: string }[] = [];

  // Transfer to Expert
  if (bookingData.expertStripeId && expertPayoutCents > 0) {
    try {
      const expertTransfer = await stripe.transfers.create({
        amount: expertPayoutCents,
        currency: "usd",
        destination: bookingData.expertStripeId,
        source_transaction: paymentIntentId,
        metadata: { bookingId: bookingRef.id, type: "expert_payout" },
      });
      
      transfers.push({
        type: "expert",
        amount: expertPayoutCents,
        destination: bookingData.expertStripeId,
        transferId: expertTransfer.id,
      });
      
      console.log(`Expert transfer created: ${expertTransfer.id}`);
    } catch (err: any) {
      console.error(`Failed to transfer to expert: ${err.message}`);
    }
  }

  // Transfer to Partner
  if (bookingData.partnerStripeId && partnerPayoutCents > 0) {
    try {
      const partnerTransfer = await stripe.transfers.create({
        amount: partnerPayoutCents,
        currency: "usd",
        destination: bookingData.partnerStripeId,
        source_transaction: paymentIntentId,
        metadata: { bookingId: bookingRef.id, type: "partner_commission" },
      });
      
      transfers.push({
        type: "partner",
        amount: partnerPayoutCents,
        destination: bookingData.partnerStripeId,
        transferId: partnerTransfer.id,
      });
      
      console.log(`Partner transfer created: ${partnerTransfer.id}`);
    } catch (err: any) {
      console.error(`Failed to transfer to partner: ${err.message}`);
    }
  }

  // Update Firestore
  await bookingRef.update({
    status: "confirmed",
    paymentStatus: "paid",
    paymentIntentId: paymentIntentId,
    checkoutSessionId: session.id,
    platformFeeCents: platformFeeCents,
    expertPayoutCents: expertPayoutCents,
    partnerPayoutCents: partnerPayoutCents,
    transfers: transfers,
    paidAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`Booking ${bookingRef.id} marked as paid and confirmed`);

  // Audit trail
  await db.collection("transactions").add({
    bookingId: bookingRef.id,
    type: "checkout_complete",
    totalCents: totalCents,
    platformFeeCents: platformFeeCents,
    expertPayoutCents: expertPayoutCents,
    partnerPayoutCents: partnerPayoutCents,
    transfers: transfers,
    stripeSessionId: session.id,
    stripePaymentIntentId: paymentIntentId,
    config: {
      platformFeePercent: config.platform.feePercent,
      partnerCommissionPercent: config.platform.partnerCommissionPercent,
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

// ============================================
// UTILITY ENDPOINTS
// ============================================

export const healthCheck = functions.https.onRequest((req, res) => {
  const config = getConfig();
  res.json({
    status: "ok",
    service: "Locale by ACHIEVEMOR - Cloud Functions",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    configured: {
      stripeSecret: !!config.stripe.secret,
      stripeWebhook: !!config.stripe.webhook,
      platformFee: `${config.platform.feePercent * 100}%`,
      partnerCommission: `${config.platform.partnerCommissionPercent * 100}%`,
    },
  });
});

export const getPlatformStats = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be authenticated");
  }

  const bookingsSnapshot = await db.collection("bookings")
    .where("status", "==", "confirmed")
    .get();

  let totalRevenue = 0;
  let totalPlatformFees = 0;
  let totalExpertPayouts = 0;
  let totalPartnerPayouts = 0;

  bookingsSnapshot.forEach(doc => {
    const docData = doc.data();
    totalRevenue += docData.totalCents || 0;
    totalPlatformFees += docData.platformFeeCents || 0;
    totalExpertPayouts += docData.expertPayoutCents || 0;
    totalPartnerPayouts += docData.partnerPayoutCents || 0;
  });

  return {
    totalBookings: bookingsSnapshot.size,
    totalRevenue: totalRevenue / 100,
    totalPlatformFees: totalPlatformFees / 100,
    totalExpertPayouts: totalExpertPayouts / 100,
    totalPartnerPayouts: totalPartnerPayouts / 100,
  };
});

// ============================================
// CRAWLERS & AUTOMATION
// ============================================

export * from "./crawlers/businessHarvester";
