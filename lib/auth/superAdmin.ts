/**
 * Super Admin Authentication & Authorization System
 * Email-based whitelist stored in Firestore for dynamic updates
 * Only accessible to platform owners - never visible to partners or clients
 */

import { doc, getDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, auth } from '../gcp'; // Using the Firestore instance

// ==========================================
// CONFIGURATION
// ==========================================

const SUPER_ADMIN_DOC_PATH = 'system_settings/super_admins';

// Default admin emails (seeded on first load)
const DEFAULT_SUPER_ADMINS = [
  'rishj@achievemor.com',
  'admin@locale.app',
  'boomerang9@gmail.com', // Repository owner
];

// ==========================================
// TYPES
// ==========================================

export interface SuperAdminConfig {
  emails: string[];
  created_at: Date;
  updated_at: Date;
  last_accessed_by?: string;
}

export interface AdminSession {
  userId: string;
  email: string;
  isSuperAdmin: boolean;
  accessLevel: 'none' | 'viewer' | 'admin' | 'super_admin';
  lastVerified: Date;
}

// ==========================================
// CORE FUNCTIONS
// ==========================================

/**
 * Check if a user is a Super Admin
 * Queries Firestore for the current whitelist
 */
export async function isSuperAdmin(user: User | null): Promise<boolean> {
  if (!user || !user.email) return false;
  
  try {
    const adminDocRef = doc(db, SUPER_ADMIN_DOC_PATH);
    const adminDoc = await getDoc(adminDocRef);
    
    if (!adminDoc.exists()) {
      // Initialize with defaults if not exists
      await initializeSuperAdminConfig();
      return DEFAULT_SUPER_ADMINS.includes(user.email.toLowerCase());
    }
    
    const config = adminDoc.data() as SuperAdminConfig;
    return config.emails.map(e => e.toLowerCase()).includes(user.email.toLowerCase());
  } catch (error) {
    console.error('Super Admin check failed:', error);
    // Fallback to hardcoded list in case of Firestore issues
    return DEFAULT_SUPER_ADMINS.includes(user.email.toLowerCase());
  }
}

/**
 * Get the full admin session for a user
 */
export async function getAdminSession(user: User | null): Promise<AdminSession> {
  if (!user || !user.email) {
    return {
      userId: '',
      email: '',
      isSuperAdmin: false,
      accessLevel: 'none',
      lastVerified: new Date(),
    };
  }
  
  const superAdmin = await isSuperAdmin(user);
  
  return {
    userId: user.uid,
    email: user.email,
    isSuperAdmin: superAdmin,
    accessLevel: superAdmin ? 'super_admin' : 'none',
    lastVerified: new Date(),
  };
}

/**
 * Initialize the Super Admin configuration in Firestore
 */
export async function initializeSuperAdminConfig(): Promise<void> {
  try {
    const adminDocRef = doc(db, SUPER_ADMIN_DOC_PATH);
    await setDoc(adminDocRef, {
      emails: DEFAULT_SUPER_ADMINS,
      created_at: new Date(),
      updated_at: new Date(),
    });
    console.log('Super Admin config initialized');
  } catch (error) {
    console.error('Failed to initialize Super Admin config:', error);
  }
}

/**
 * Add a new Super Admin email (only callable by existing super admins)
 */
export async function addSuperAdmin(email: string, addedBy: User): Promise<boolean> {
  if (!await isSuperAdmin(addedBy)) {
    console.error('Unauthorized: Only super admins can add new admins');
    return false;
  }
  
  try {
    const adminDocRef = doc(db, SUPER_ADMIN_DOC_PATH);
    await setDoc(adminDocRef, {
      emails: arrayUnion(email.toLowerCase()),
      updated_at: new Date(),
      last_accessed_by: addedBy.email,
    }, { merge: true });
    
    console.log(`Added super admin: ${email}`);
    return true;
  } catch (error) {
    console.error('Failed to add super admin:', error);
    return false;
  }
}

/**
 * Remove a Super Admin email (only callable by existing super admins)
 */
export async function removeSuperAdmin(email: string, removedBy: User): Promise<boolean> {
  if (!await isSuperAdmin(removedBy)) {
    console.error('Unauthorized: Only super admins can remove admins');
    return false;
  }
  
  // Prevent removing yourself
  if (removedBy.email?.toLowerCase() === email.toLowerCase()) {
    console.error('Cannot remove yourself as super admin');
    return false;
  }
  
  try {
    const adminDocRef = doc(db, SUPER_ADMIN_DOC_PATH);
    await setDoc(adminDocRef, {
      emails: arrayRemove(email.toLowerCase()),
      updated_at: new Date(),
      last_accessed_by: removedBy.email,
    }, { merge: true });
    
    console.log(`Removed super admin: ${email}`);
    return true;
  } catch (error) {
    console.error('Failed to remove super admin:', error);
    return false;
  }
}

/**
 * Get the list of all Super Admin emails
 */
export async function getSuperAdminList(requestedBy: User): Promise<string[]> {
  if (!await isSuperAdmin(requestedBy)) {
    console.error('Unauthorized: Only super admins can view the admin list');
    return [];
  }
  
  try {
    const adminDocRef = doc(db, SUPER_ADMIN_DOC_PATH);
    const adminDoc = await getDoc(adminDocRef);
    
    if (!adminDoc.exists()) {
      return DEFAULT_SUPER_ADMINS;
    }
    
    const config = adminDoc.data() as SuperAdminConfig;
    return config.emails;
  } catch (error) {
    console.error('Failed to get super admin list:', error);
    return [];
  }
}

// ==========================================
// AUDIT LOGGING
// ==========================================

export async function logAdminAction(
  user: User,
  action: string,
  details: Record<string, any>
): Promise<void> {
  if (!await isSuperAdmin(user)) return;
  
  try {
    const { logEvent } = await import('../firestore/logger');
    await logEvent(
      `admin_action:${action}`,
      'admin',
      {
        admin_email: user.email,
        admin_uid: user.uid,
        action,
        ...details,
      },
      'info',
      user.uid,
    );
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}
