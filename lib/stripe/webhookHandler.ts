/**
 * Stripe Webhook Handler for Cloud Run
 * 
 * This file is designed to be deployed as a Cloud Run service
 * or Cloud Function to handle Stripe webhook events.
 * 
 * DEPLOYMENT:
 * 1. Create a new Cloud Run service
 * 2. Set environment variables: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
 * 3. Configure Stripe to send webhooks to your Cloud Run URL
 * 
 * Environment Variables Required:
 * - STRIPE_SECRET_KEY: Your Stripe secret key
 * - STRIPE_WEBHOOK_SECRET: Webhook signing secret from Stripe Dashboard
 * - FIREBASE_PROJECT_ID: Your Firebase project ID
 */

// NOTE: This is a template for Cloud Run deployment
// In production, this would be a standalone Node.js service

/*
import Stripe from 'stripe';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin (for Cloud Run)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function handleWebhook(req: Request): Promise<Response> {
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();

  if (!sig) {
    return new Response('Missing signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Log the event to Firestore
  await db.collection('system_logs').add({
    event_type: event.type,
    source: 'stripe',
    severity: 'info',
    payload: event.data.object,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Handle specific events
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
      break;
    
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
      break;

    case 'transfer.created':
      await handleTransferCreated(event.data.object as Stripe.Transfer);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.booking_id;
  if (!bookingId) return;

  // Get booking and related data
  const bookingRef = db.collection('bookings').doc(bookingId);
  const booking = await bookingRef.get();
  
  if (!booking.exists) {
    console.error('Booking not found:', bookingId);
    return;
  }

  const data = booking.data()!;
  const platformFeeCents = Number(data.platform_fee_cents);
  const totalCents = Number(data.total_cents);
  const expertShare = totalCents - platformFeeCents;

  // Get expert's Stripe Connect ID
  const expertDoc = await db.collection('profiles').doc(data.expert_id).get();
  const expertData = expertDoc.data();

  if (expertData?.stripe_connect_id) {
    // Transfer to expert
    await stripe.transfers.create({
      amount: expertShare,
      currency: 'usd',
      destination: expertData.stripe_connect_id,
      source_transaction: session.payment_intent as string,
      metadata: { booking_id: bookingId, type: 'expert_payout' },
    });
  }

  // Check for partner commission
  if (expertData?.parent_partner_id) {
    const partnerDoc = await db.collection('profiles').doc(expertData.parent_partner_id).get();
    const partnerData = partnerDoc.data();

    if (partnerData?.stripe_connect_id) {
      const commissionRate = partnerData.commission_rate_override || 0.15;
      const partnerShare = Math.floor(platformFeeCents * commissionRate);

      await stripe.transfers.create({
        amount: partnerShare,
        currency: 'usd',
        destination: partnerData.stripe_connect_id,
        source_transaction: session.payment_intent as string,
        metadata: { booking_id: bookingId, type: 'partner_commission' },
      });

      // Update partner earnings
      await db.collection('profiles').doc(expertData.parent_partner_id).update({
        total_earnings_cents: admin.firestore.FieldValue.increment(partnerShare),
      });
    }
  }

  // Update booking status
  await bookingRef.update({
    status: 'confirmed',
    payment_status: 'paid',
    stripe_payment_intent_id: session.payment_intent,
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  // Additional payment success handling if needed
  console.log('Payment succeeded:', paymentIntent.id);
}

async function handleTransferCreated(transfer: Stripe.Transfer) {
  // Log transfer for audit trail
  await db.collection('system_logs').add({
    event_type: 'stripe.transfer.created',
    source: 'stripe',
    severity: 'info',
    payload: {
      transfer_id: transfer.id,
      amount: transfer.amount,
      destination: transfer.destination,
      metadata: transfer.metadata,
    },
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  });
}
*/

// Type exports for client-side use
export interface WebhookEvent {
  type: string;
  source: 'stripe' | 'ballerine';
  payload: any;
}

// Mock handler for development
export async function mockWebhookHandler(event: WebhookEvent): Promise<void> {
  console.log('[Webhook Mock] Event received:', event.type);
  // In development, just log the event
}

export const WEBHOOK_EVENTS = {
  CHECKOUT_COMPLETE: 'checkout.session.completed',
  PAYMENT_SUCCESS: 'payment_intent.succeeded',
  TRANSFER_CREATED: 'transfer.created',
  VERIFICATION_SUCCESS: 'identity.verification_session.verified',
  VERIFICATION_PENDING: 'identity.verification_session.requires_input',
} as const;
