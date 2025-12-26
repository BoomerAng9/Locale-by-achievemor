
export type UserRole = 'technician' | 'client' | 'admin' | 'professional';

export interface IndustryTemplate {
  id: string;
  name: string;
  icon: string; // Lucide icon name or emoji
  system_prompt: string;
  tools_enabled: string[];
  quick_actions: { label: string; prompt: string }[];
  dashboard_layout: 'map_heavy' | 'data_heavy' | 'media_heavy' | 'standard' | 'generative';
  theme_color: string; // Tailwind class e.g. 'cyan-500'
}

export type ProgressionStage = 'garage' | 'community' | 'global';

export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'unverified';

export enum GarageStage {
  GARAGE = 'garage',
  COMMUNITY = 'community',
  GLOBAL = 'global'
}

export enum NurdStatus {
  ACTIVE = 'active',
  BUSY = 'busy',
  OFFLINE = 'offline'
}

// Customization Types
export type CardTheme = 'carbon' | 'neon' | 'minimal' | 'royal';

export interface ProfileCustomization {
  theme: CardTheme;
  accentColor?: string; 
  featuredSkills?: string[]; // Specific subset of skills to display
  hideRates?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconEmoji: string;
  imageUrl: string;
  tier: 1 | 2;
  avgHourlyRate: number;
  demandLevel: 'low' | 'moderate' | 'high' | 'critical';
  demandGrowthPercent: number;
  activeProfessionals: number;
  subcategories: string[];
}

export interface Profile {
  id: string;
  role: UserRole;
  displayName: string;
  title: string;
  bio: string;
  avatarUrl: string;
  location: string;
  hourlyRate: number;
  skills: string[];
  
  // Customization
  customization?: ProfileCustomization;

  // Progression
  stage: ProgressionStage;
  reputationScore: number; // 0-100
  
  // Verification
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  
  // Stats
  jobsCompleted: number;
  joinedDate: string;

  // Optional fields for Mock/Legacy compatibility
  rating?: number;
  reviewCount?: number;
  verified?: boolean;
  availableLocal?: boolean;
  availableRemote?: boolean;
  joinedYear?: number;
  
  // TechSageCard specific fields
  username?: string;
  garageStage?: GarageStage;
  level?: number;
  coreTrait?: string;
  vibeAbility?: string;
  status?: NurdStatus;
}

export interface Service {
  id: string;
  technicianId: string;
  title: string;
  description: string;
  type: 'local' | 'remote' | 'hybrid';
  price: number;
  unit: 'hour' | 'project';
  estimatedDuration?: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  clientId: string;
  technicianId: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  date: string;
  totalAmount: number;
}

// Localator Engine Types
export interface CalculatorInputs {
  hourlyRate: number;
  estimatedHours: number;
  platformFeePercent: number;
  toolCosts: number;
  taxRatePercent: number;
}

export interface CalculatorResults {
  grossRevenue: number;
  platformFees: number;
  netBeforeTax: number;
  taxes: number;
  netProfit: number;
  effectiveHourlyRate: number;
  viabilityScore: 'low' | 'medium' | 'high';
  advice: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

// Freelance Engine Types
export interface FreelanceInputs {
  clientBudget: number;
  platformFeePercent: number;
  toolCosts: number;
  taxRateEstimate: number;
  expectedHours: number;
  hourlyRate: number;
}

export interface FreelanceResults {
  grossRevenue: number;
  platformFees: number;
  toolCosts: number;
  grossProfit: number;
  taxes: number;
  netProfit: number;
  effectiveHourlyRate: number;
  dealVibe: 'HARD_PASS' | 'DECENT' | 'PRIME';
  profitMarginPercent: number;
}

// Bars Types
export interface BarsResolverOutput {
  scope: string[];
  vibe: string[];
  urgency: 'LOW' | 'MED' | 'HIGH';
  summary: string;
}

// Job/Pipeline Types
export enum JobPhase {
  IDEA = 'IDEA',
  DRAFT = 'DRAFT',
  POLISH = 'POLISH',
  SHIP = 'SHIP'
}

export interface BingeJob {
  id: string;
  phase: JobPhase;
  title: string;
  clientName: string;
  actualTokens: number;
  estimatedTokens: number;
  barsBrief?: boolean;
}

// Project Types
export interface ProjectInputs {
  clientBudget: number;
  platformFeePercent: number;
  toolCosts: number;
  taxRateEstimate: number;
  expectedHours: number;
  hourlyRate: number;
}

export interface ProjectResults {
  grossRevenue: number;
  platformFees: number;
  netBeforeTax: number;
  taxes: number;
  netProfit: number;
  effectiveHourlyRate: number;
  profitMargin: number;
  dealViability: 'avoid' | 'acceptable' | 'great';
}

// ============================================
// GEO-TARGETED AUTO-INVITE ENGINE TYPES
// ============================================

/**
 * User Locality - Stores user's geographic selection from the Interactive World Map
 */
export interface UserLocality {
  userId: string;
  country: string;
  state: string;
  primaryCity: string; // e.g., "Atlanta"
  actualZipCode: string; // e.g., "30318"
  distanceFromPrimaryCity?: number; // km (if non-listed city)
  coordinates: { lat: number; lng: number }; // Geocoded from zip
  isListedCity: boolean; // true = direct city selection, false = proximity mapping
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Business Lead - Discovered business from autonomous crawler
 */
export interface BusinessLead {
  id?: string;
  name: string;
  industry: string;
  naicsCode?: string; // North American Industry Classification System
  email?: string;
  phone?: string;
  address?: string;
  city: string;
  state: string;
  website?: string;
  employeeCount?: number;
  foundedYear?: number;
  description?: string;
  source: 'chamber' | 'llc_registry' | 'google_places' | 'bbb' | 'yelp' | 'linkedin' | 'manual';
  discoveredAt: Date;
  inviteStatus: 'pending' | 'invited' | 'joined' | 'declined' | 'bounced';
  lastContactedAt?: Date;
  retryCount: number;
}

/**
 * Invite Campaign - Tracks outreach to businesses
 */
export interface InviteCampaign {
  id?: string;
  businessLeadId: string;
  emailSubject: string;
  emailBody: string;
  partnerPageUrl: string;
  status: 'draft' | 'sent' | 'opened' | 'clicked' | 'converted' | 'bounced';
  sentAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  convertedAt?: Date;
  metrics: {
    opens: number;
    clicks: number;
    bounced: boolean;
  };
}

/**
 * Draft Partner Page - Pre-built page shown as incentive
 */
export interface DraftPartnerPage {
  id?: string;
  businessLeadId: string;
  slug: string; // e.g., "atlanta-realtors-pro"
  businessName: string;
  industry: string;
  description: string;
  serviceArea: string;
  contactEmail?: string;
  contactPhone?: string;
  status: 'draft' | 'active' | 'claimed';
  createdAt: Date;
  claimedAt?: Date;
  claimedByUserId?: string;
}

// ============================================
// SMELTEROS & BOOMER_ANG HIERARCHY TYPES
// ============================================

/**
 * Boomer_Ang C-Suite Roles
 */
export type BoomerAngRole = 
  | 'cto' // Chief Technology Officer - Manages Code & Infra
  | 'cfo' // Chief Financial Officer - Manages Stripe & Value
  | 'coo' // Chief Operating Officer - Manages Flow & Crawlers
  | 'cmo' // Chief Marketing Officer - Manages Social & Ads
  | 'cdo' // Chief Design Officer - Manages Nano Banana/Images
  | 'cpo' // Chief Publication Officer - Manages Content
  | 'finder' // Legacy role
  | 'debugger' // Legacy role
  | 'orchestrator'; // AVVA NOON

/**
 * SmelterOS System Status
 */
export interface SmelterOSStatus {
  isOnline: boolean;
  activeAgents: number;
  systemLoad: number;
  plausibilityBound: {
    min: number; // -10^18
    max: number; // 10^18
  };
  lastHealthCheck: Date;
}

/**
 * Tracked City - Cities where we actively crawl for businesses
 */
export interface TrackedCity {
  id?: string;
  name: string;
  state: string;
  country: string;
  coordinates: { lat: number; lng: number };
  activeUsers: number;
  lastCrawledAt?: Date;
  businessLeadsCount: number;
  isActive: boolean;
}
