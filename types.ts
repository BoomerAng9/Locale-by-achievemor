
export type UserRole = 'technician' | 'client' | 'admin' | 'professional';

export interface IndustryTemplate {
  id: string;
  name: string;
  icon: string; // Lucide icon name or emoji
  system_prompt: string;
  tools_enabled: string[];
  quick_actions: { label: string; prompt: string }[];
  dashboard_layout: 'map_heavy' | 'data_heavy' | 'media_heavy' | 'standard';
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
