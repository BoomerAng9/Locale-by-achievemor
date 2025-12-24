/**
 * System Logger - The "Nervous System Memory"
 * Logs all critical events to Firestore for audit trail
 */

import { collection, addDoc, Timestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../gcp';
import type { SystemLog, LogSeverity, LogSource } from './schema';

const LOGS_COLLECTION = 'system_logs';

/**
 * Log an event to the Nervous System
 */
export async function logEvent(
  event_type: string,
  source: LogSource,
  payload: Record<string, any>,
  severity: LogSeverity = 'info',
  user_id?: string
): Promise<string | null> {
  try {
    const logEntry: Omit<SystemLog, 'id'> = {
      event_type,
      source,
      severity,
      payload,
      user_id,
      created_at: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, LOGS_COLLECTION), logEntry);
    return docRef.id;
  } catch (error) {
    console.error('[NervousSystem] Failed to log event:', error);
    return null;
  }
}

/**
 * Convenience loggers for different severities
 */
export const logger = {
  debug: (event: string, source: LogSource, payload: any, userId?: string) =>
    logEvent(event, source, payload, 'debug', userId),
    
  info: (event: string, source: LogSource, payload: any, userId?: string) =>
    logEvent(event, source, payload, 'info', userId),
    
  warn: (event: string, source: LogSource, payload: any, userId?: string) =>
    logEvent(event, source, payload, 'warn', userId),
    
  error: (event: string, source: LogSource, payload: any, userId?: string) =>
    logEvent(event, source, payload, 'error', userId),
    
  critical: (event: string, source: LogSource, payload: any, userId?: string) =>
    logEvent(event, source, payload, 'critical', userId),
};

/**
 * Stripe-specific event logging
 */
export async function logStripeEvent(
  eventType: string, 
  payload: any
): Promise<void> {
  await logEvent(`stripe.${eventType}`, 'stripe', {
    stripe_event_id: payload.id,
    object_type: payload.object,
    data: payload.data?.object || payload,
  });
}

/**
 * Auth event logging
 */
export async function logAuthEvent(
  action: 'login' | 'logout' | 'register' | 'password_reset',
  userId: string,
  metadata?: Record<string, any>
): Promise<void> {
  await logEvent(`auth.${action}`, 'auth', {
    ...metadata,
    timestamp: new Date().toISOString(),
  }, 'info', userId);
}

/**
 * Verification event logging
 */
export async function logVerificationEvent(
  status: 'started' | 'pending' | 'approved' | 'rejected',
  userId: string,
  verificationId: string
): Promise<void> {
  await logEvent(`verification.${status}`, 'verification', {
    verification_id: verificationId,
  }, status === 'rejected' ? 'warn' : 'info', userId);
}

/**
 * Fetch recent logs for admin dashboard
 */
export async function getRecentLogs(
  source?: LogSource,
  limitCount: number = 50
): Promise<SystemLog[]> {
  try {
    let q = query(
      collection(db, LOGS_COLLECTION),
      orderBy('created_at', 'desc'),
      limit(limitCount)
    );
    
    if (source) {
      q = query(
        collection(db, LOGS_COLLECTION),
        where('source', '==', source),
        orderBy('created_at', 'desc'),
        limit(limitCount)
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as SystemLog[];
  } catch (error) {
    console.error('[NervousSystem] Failed to fetch logs:', error);
    return [];
  }
}
