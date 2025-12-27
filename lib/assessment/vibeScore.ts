/**
 * FDH V.I.B.E. Score Engine
 * Verification Intelligence Behavioral Evaluation
 * 
 * Calculates partner scores based on:
 * - V: Verification (25%) - Identity, background, portfolio
 * - I: Intelligence (25%) - Cognitive aptitude
 * - B: Behavioral (30%) - Personality traits
 * - E: Evaluation (20%) - Reviews + activity
 */

// === TYPES ===

export interface VIBEScore {
  total: number;           // 0-100 composite score
  verification: number;    // 0-100
  intelligence: number;    // 0-100
  behavioral: number;      // 0-100
  evaluation: number;      // 0-100
  personalityType: PersonalityType;
  tier: VIBETier;
  badges: VIBEBadge[];
}

export type PersonalityType = 'D' | 'I' | 'S' | 'C' | 'DI' | 'IS' | 'SC' | 'CD';

export interface PersonalityProfile {
  type: PersonalityType;
  name: string;
  description: string;
  strengths: string[];
  workStyle: string;
  communicationTips: string[];
}

export type VIBETier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'elite';

export interface VIBEBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface AssessmentAnswer {
  questionId: string;
  value: number; // 1-5 scale
}

export interface AssessmentResult {
  section: 'verification' | 'intelligence' | 'behavioral' | 'evaluation';
  score: number;
  answers: AssessmentAnswer[];
  completedAt: string;
}

// === PERSONALITY DEFINITIONS ===

export const PERSONALITY_PROFILES: Record<PersonalityType, PersonalityProfile> = {
  D: {
    type: 'D',
    name: 'Driver',
    description: 'Results-oriented and decisive. Takes charge and drives projects forward.',
    strengths: ['Leadership', 'Decision Making', 'Problem Solving', 'Goal Setting'],
    workStyle: 'Fast-paced, direct, focused on outcomes',
    communicationTips: ['Be direct and concise', 'Focus on results', 'Respect their time'],
  },
  I: {
    type: 'I',
    name: 'Influencer',
    description: 'Social and enthusiastic. Builds relationships and inspires teams.',
    strengths: ['Communication', 'Networking', 'Creativity', 'Motivation'],
    workStyle: 'Collaborative, energetic, people-focused',
    communicationTips: ['Be friendly and open', 'Allow discussion time', 'Recognize contributions'],
  },
  S: {
    type: 'S',
    name: 'Steady',
    description: 'Reliable and supportive. Provides stability and consistency.',
    strengths: ['Reliability', 'Patience', 'Team Support', 'Follow-through'],
    workStyle: 'Consistent, methodical, team-oriented',
    communicationTips: ['Provide clear expectations', 'Give advance notice of changes', 'Show appreciation'],
  },
  C: {
    type: 'C',
    name: 'Conscientious',
    description: 'Analytical and detail-focused. Ensures quality and accuracy.',
    strengths: ['Analysis', 'Quality Control', 'Planning', 'Research'],
    workStyle: 'Structured, precise, data-driven',
    communicationTips: ['Provide details and data', 'Allow processing time', 'Be accurate'],
  },
  DI: {
    type: 'DI',
    name: 'Trailblazer',
    description: 'Dynamic leader who drives innovation through influence.',
    strengths: ['Vision', 'Persuasion', 'Initiative', 'Charisma'],
    workStyle: 'Bold, inspiring, action-oriented',
    communicationTips: ['Match their energy', 'Focus on big picture', 'Be enthusiastic'],
  },
  IS: {
    type: 'IS',
    name: 'Collaborator',
    description: 'People-focused team player who builds lasting relationships.',
    strengths: ['Relationship Building', 'Diplomacy', 'Team Harmony', 'Empathy'],
    workStyle: 'Friendly, supportive, consensus-building',
    communicationTips: ['Build rapport first', 'Show genuine interest', 'Be patient'],
  },
  SC: {
    type: 'SC',
    name: 'Specialist',
    description: 'Detail-oriented expert who delivers consistent quality.',
    strengths: ['Expertise', 'Consistency', 'Thoroughness', 'Dependability'],
    workStyle: 'Methodical, precise, quality-focused',
    communicationTips: ['Provide clear processes', 'Respect expertise', 'Be specific'],
  },
  CD: {
    type: 'CD',
    name: 'Strategist',
    description: 'Analytical leader who combines data with decisive action.',
    strengths: ['Strategic Thinking', 'Analysis', 'Efficiency', 'Problem Solving'],
    workStyle: 'Logic-driven, systematic, results-focused',
    communicationTips: ['Lead with data', 'Be prepared', 'Focus on efficiency'],
  },
};

// === TIER DEFINITIONS ===

export const VIBE_TIERS: Record<VIBETier, { min: number; max: number; color: string; label: string }> = {
  bronze: { min: 0, max: 49, color: '#CD7F32', label: 'Bronze Partner' },
  silver: { min: 50, max: 69, color: '#C0C0C0', label: 'Silver Partner' },
  gold: { min: 70, max: 84, color: '#FFD700', label: 'Gold Partner' },
  platinum: { min: 85, max: 94, color: '#E5E4E2', label: 'Platinum Partner' },
  elite: { min: 95, max: 100, color: '#39FF14', label: 'Elite Partner' },
};

// === BADGE DEFINITIONS ===

export const AVAILABLE_BADGES: VIBEBadge[] = [
  { id: 'verified', name: 'Verified', icon: '✓', description: 'Identity verified' },
  { id: 'top-rated', name: 'Top Rated', icon: '⭐', description: '4.8+ rating' },
  { id: 'fast-responder', name: 'Fast Responder', icon: '⚡', description: 'Responds within 1 hour' },
  { id: 'expert', name: 'Expert', icon: '🎓', description: 'Demonstrated expertise' },
  { id: 'reliable', name: 'Reliable', icon: '🛡️', description: '100% completion rate' },
  { id: 'innovator', name: 'Innovator', icon: '💡', description: 'Creative problem solver' },
];

// === SCORE CALCULATION ===

const WEIGHTS = {
  verification: 0.25,
  intelligence: 0.25,
  behavioral: 0.30,
  evaluation: 0.20,
};

export function calculateVIBEScore(results: AssessmentResult[]): VIBEScore {
  const scores = {
    verification: 0,
    intelligence: 0,
    behavioral: 0,
    evaluation: 0,
  };

  // Extract scores from results
  results.forEach(result => {
    scores[result.section] = result.score;
  });

  // Calculate weighted total
  const total = Math.round(
    scores.verification * WEIGHTS.verification +
    scores.intelligence * WEIGHTS.intelligence +
    scores.behavioral * WEIGHTS.behavioral +
    scores.evaluation * WEIGHTS.evaluation
  );

  // Determine personality type from behavioral answers
  const behavioralResult = results.find(r => r.section === 'behavioral');
  const personalityType = determinePersonalityType(behavioralResult?.answers || []);

  // Determine tier
  const tier = determineTier(total);

  // Award badges
  const badges = determineBadges(scores, total);

  return {
    total,
    ...scores,
    personalityType,
    tier,
    badges,
  };
}

function determinePersonalityType(answers: AssessmentAnswer[]): PersonalityType {
  // DISC calculation based on answer patterns
  const traits = { D: 0, I: 0, S: 0, C: 0 };
  
  answers.forEach((answer, index) => {
    // Map answers to DISC traits based on question categories
    const category = index % 4;
    switch (category) {
      case 0: traits.D += answer.value; break;
      case 1: traits.I += answer.value; break;
      case 2: traits.S += answer.value; break;
      case 3: traits.C += answer.value; break;
    }
  });

  // Find primary and secondary traits
  const sorted = Object.entries(traits).sort((a, b) => b[1] - a[1]);
  const primary = sorted[0][0] as 'D' | 'I' | 'S' | 'C';
  const secondary = sorted[1][0] as 'D' | 'I' | 'S' | 'C';

  // If secondary is close to primary, return combined type
  if (sorted[1][1] >= sorted[0][1] * 0.8) {
    return `${primary}${secondary}` as PersonalityType;
  }

  return primary;
}

function determineTier(score: number): VIBETier {
  for (const [tier, config] of Object.entries(VIBE_TIERS)) {
    if (score >= config.min && score <= config.max) {
      return tier as VIBETier;
    }
  }
  return 'bronze';
}

function determineBadges(scores: Record<string, number>, total: number): VIBEBadge[] {
  const badges: VIBEBadge[] = [];

  if (scores.verification >= 80) {
    badges.push(AVAILABLE_BADGES.find(b => b.id === 'verified')!);
  }
  if (total >= 90) {
    badges.push(AVAILABLE_BADGES.find(b => b.id === 'top-rated')!);
  }
  if (scores.behavioral >= 85) {
    badges.push(AVAILABLE_BADGES.find(b => b.id === 'reliable')!);
  }
  if (scores.intelligence >= 90) {
    badges.push(AVAILABLE_BADGES.find(b => b.id === 'expert')!);
  }

  return badges;
}

// === SCORE DISPLAY HELPERS ===

export function getScoreColor(score: number): string {
  if (score >= 90) return '#39FF14'; // Neon green
  if (score >= 70) return '#FFD700'; // Gold
  if (score >= 50) return '#FFA500'; // Orange
  return '#FF6B6B'; // Red
}

export function getScoreLabel(score: number): string {
  if (score >= 95) return 'Exceptional';
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Strong';
  if (score >= 50) return 'Developing';
  return 'Emerging';
}

// === LOCAL STORAGE ===

const VIBE_STORAGE_KEY = 'achievemor_vibe_score';

export function saveVIBEScore(userId: string, score: VIBEScore): void {
  const data = JSON.parse(localStorage.getItem(VIBE_STORAGE_KEY) || '{}');
  data[userId] = { ...score, updatedAt: new Date().toISOString() };
  localStorage.setItem(VIBE_STORAGE_KEY, JSON.stringify(data));
}

export function getVIBEScore(userId: string): VIBEScore | null {
  const data = JSON.parse(localStorage.getItem(VIBE_STORAGE_KEY) || '{}');
  return data[userId] || null;
}
