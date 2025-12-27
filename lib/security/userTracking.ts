/**
 * User Security Tracking Layer
 * CrystalKnows-inspired user behavior analytics
 * 
 * Tracks:
 * - Session patterns
 * - Behavioral signals
 * - Trust score calculation
 * - Anomaly detection
 */

// === TYPES ===

export interface UserSession {
  userId: string;
  sessionId: string;
  startTime: string;
  lastActivity: string;
  pageViews: PageView[];
  interactions: Interaction[];
  deviceInfo: DeviceInfo;
}

export interface PageView {
  path: string;
  timestamp: string;
  duration: number; // seconds
}

export interface Interaction {
  type: 'click' | 'scroll' | 'input' | 'submit' | 'error';
  target: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface DeviceInfo {
  userAgent: string;
  screenSize: string;
  language: string;
  timezone: string;
  platform: string;
}

export interface TrustScore {
  score: number; // 0-100
  level: 'high' | 'medium' | 'low' | 'suspicious';
  flags: SecurityFlag[];
  lastUpdated: string;
}

export interface SecurityFlag {
  type: 'velocity' | 'location' | 'device' | 'behavior' | 'pattern';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
}

// === STORAGE KEYS ===

const SESSION_KEY = 'achievemor_session';
const TRUST_KEY = 'achievemor_trust_score';
const HISTORY_KEY = 'achievemor_user_history';

// === SESSION MANAGEMENT ===

export function initSession(userId: string): UserSession {
  const session: UserSession = {
    userId,
    sessionId: generateSessionId(),
    startTime: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    pageViews: [],
    interactions: [],
    deviceInfo: getDeviceInfo(),
  };
  
  saveSession(session);
  return session;
}

export function getSession(): UserSession | null {
  const data = sessionStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

export function saveSession(session: UserSession): void {
  session.lastActivity = new Date().toISOString();
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function endSession(): void {
  const session = getSession();
  if (session) {
    // Archive to history
    archiveSession(session);
    sessionStorage.removeItem(SESSION_KEY);
  }
}

// === PAGE VIEW TRACKING ===

let currentPageStart: number = Date.now();
let currentPath: string = '';

export function trackPageView(path: string): void {
  const session = getSession();
  if (!session) return;

  // Calculate duration of previous page
  if (currentPath && currentPageStart) {
    const duration = Math.round((Date.now() - currentPageStart) / 1000);
    const prevView = session.pageViews.find(pv => pv.path === currentPath);
    if (prevView) {
      prevView.duration = duration;
    }
  }

  // Add new page view
  session.pageViews.push({
    path,
    timestamp: new Date().toISOString(),
    duration: 0,
  });

  currentPath = path;
  currentPageStart = Date.now();
  
  saveSession(session);
  
  // Analyze for anomalies
  checkPageVelocity(session);
}

// === INTERACTION TRACKING ===

export function trackInteraction(type: Interaction['type'], target: string, metadata?: Record<string, any>): void {
  const session = getSession();
  if (!session) return;

  session.interactions.push({
    type,
    target,
    timestamp: new Date().toISOString(),
    metadata,
  });

  // Keep only last 100 interactions
  if (session.interactions.length > 100) {
    session.interactions = session.interactions.slice(-100);
  }

  saveSession(session);
  
  // Check for suspicious patterns
  checkInteractionPatterns(session);
}

// === TRUST SCORE CALCULATION ===

export function calculateTrustScore(userId: string): TrustScore {
  const session = getSession();
  const history = getUserHistory(userId);
  const flags: SecurityFlag[] = [];
  
  let score = 100; // Start with full trust

  // Check session age
  if (session) {
    const sessionAge = Date.now() - new Date(session.startTime).getTime();
    if (sessionAge < 60000) { // Less than 1 minute
      score -= 10;
      flags.push({
        type: 'velocity',
        severity: 'info',
        message: 'New session',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Check device consistency
  if (history.length > 0 && session) {
    const lastDevice = history[history.length - 1].deviceInfo;
    if (lastDevice.platform !== session.deviceInfo.platform) {
      score -= 15;
      flags.push({
        type: 'device',
        severity: 'warning',
        message: 'Different device detected',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Check page velocity
  if (session && session.pageViews.length > 10) {
    const recentViews = session.pageViews.slice(-10);
    const avgDuration = recentViews.reduce((a, b) => a + b.duration, 0) / recentViews.length;
    if (avgDuration < 2) {
      score -= 20;
      flags.push({
        type: 'velocity',
        severity: 'warning',
        message: 'Unusually fast page navigation',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Check interaction patterns
  if (session && session.interactions.length > 50) {
    const clickRate = session.interactions.filter(i => i.type === 'click').length / session.interactions.length;
    if (clickRate > 0.9) {
      score -= 15;
      flags.push({
        type: 'pattern',
        severity: 'warning',
        message: 'Unusual click pattern detected',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Determine level
  let level: TrustScore['level'];
  if (score >= 80) level = 'high';
  else if (score >= 60) level = 'medium';
  else if (score >= 40) level = 'low';
  else level = 'suspicious';

  const trustScore: TrustScore = {
    score: Math.max(0, score),
    level,
    flags,
    lastUpdated: new Date().toISOString(),
  };

  saveTrustScore(userId, trustScore);
  return trustScore;
}

export function getTrustScore(userId: string): TrustScore | null {
  const data = localStorage.getItem(`${TRUST_KEY}_${userId}`);
  return data ? JSON.parse(data) : null;
}

function saveTrustScore(userId: string, score: TrustScore): void {
  localStorage.setItem(`${TRUST_KEY}_${userId}`, JSON.stringify(score));
}

// === HELPER FUNCTIONS ===

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getDeviceInfo(): DeviceInfo {
  return {
    userAgent: navigator.userAgent,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: navigator.platform,
  };
}

function getUserHistory(userId: string): UserSession[] {
  const data = localStorage.getItem(`${HISTORY_KEY}_${userId}`);
  return data ? JSON.parse(data) : [];
}

function archiveSession(session: UserSession): void {
  const history = getUserHistory(session.userId);
  history.push(session);
  
  // Keep only last 10 sessions
  const trimmed = history.slice(-10);
  localStorage.setItem(`${HISTORY_KEY}_${session.userId}`, JSON.stringify(trimmed));
}

function checkPageVelocity(session: UserSession): void {
  if (session.pageViews.length < 3) return;
  
  const recent = session.pageViews.slice(-3);
  const timeDiffs = [];
  for (let i = 1; i < recent.length; i++) {
    const diff = new Date(recent[i].timestamp).getTime() - new Date(recent[i-1].timestamp).getTime();
    timeDiffs.push(diff);
  }
  
  const avgDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
  
  if (avgDiff < 500) { // Less than 0.5 seconds between pages
    console.warn('[Security] Suspicious page velocity detected');
  }
}

function checkInteractionPatterns(session: UserSession): void {
  if (session.interactions.length < 10) return;
  
  const recent = session.interactions.slice(-10);
  const errors = recent.filter(i => i.type === 'error').length;
  
  if (errors > 5) {
    console.warn('[Security] High error rate detected');
  }
}

// === INITIALIZATION ===

export function initSecurityTracking(userId: string): void {
  // Initialize session if not exists
  if (!getSession()) {
    initSession(userId);
  }
  
  // Track page views on navigation
  if (typeof window !== 'undefined') {
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      trackPageView(window.location.pathname);
    };
    
    window.addEventListener('popstate', () => {
      trackPageView(window.location.pathname);
    });
    
    // Track initial page
    trackPageView(window.location.pathname);
  }
  
  console.log('[Security] User tracking initialized');
}
