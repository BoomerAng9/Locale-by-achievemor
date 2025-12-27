/**
 * ProfessionalCard - V.I.B.E. Score Profile Card
 * 
 * Displays partner profiles with V.I.B.E. scores instead of hourly rates.
 * Shows personality type, tier badge, and verification status.
 * 
 * V.I.B.E. = Verification Intelligence Behavioral Evaluation
 */

import React from 'react';
import { Profile, ProgressionStage } from '../types';
import { 
  VIBEScore, 
  getScoreColor, 
  VIBE_TIERS, 
  PERSONALITY_PROFILES,
  PersonalityType 
} from '../lib/assessment/vibeScore';

interface ProfessionalCardProps {
  profile: Profile;
  vibeScore?: VIBEScore;  // V.I.B.E. score data
  onClick?: () => void;
  showVibe?: boolean;     // Show V.I.B.E. score (default true)
  isPro?: boolean;
  compact?: boolean;
}

const STAGE_CONFIG: Record<ProgressionStage, { label: string; color: string; bg: string }> = {
  garage: { 
    label: 'Garage', 
    color: 'text-orange-400', 
    bg: 'bg-orange-500/10 border-orange-500/30' 
  },
  community: { 
    label: 'Community', 
    color: 'text-locale-blue', 
    bg: 'bg-locale-blue/10 border-locale-blue/30' 
  },
  global: { 
    label: 'Global', 
    color: 'text-green-400', 
    bg: 'bg-green-500/10 border-green-500/30' 
  },
};

// Mock V.I.B.E. scores for demo (would come from database in production)
const generateMockVibe = (name: string): VIBEScore => {
  const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const score = 65 + (hash % 35); // 65-99 range
  const types: PersonalityType[] = ['D', 'I', 'S', 'C', 'DI', 'IS', 'SC', 'CD'];
  return {
    total: score,
    verification: 70 + (hash % 30),
    intelligence: 60 + (hash % 40),
    behavioral: 75 + (hash % 25),
    evaluation: 65 + (hash % 35),
    personalityType: types[hash % types.length],
    tier: score >= 95 ? 'elite' : score >= 85 ? 'platinum' : score >= 70 ? 'gold' : score >= 50 ? 'silver' : 'bronze',
    badges: [],
  };
};

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({ 
  profile, 
  vibeScore,
  onClick, 
  showVibe = true,
  isPro = false,
  compact = false,
}) => {
  const stage = profile.stage || 'garage';
  const stageConfig = STAGE_CONFIG[stage];
  const skills = profile.skills?.slice(0, 4) || [];
  const isVerified = profile.verificationStatus === 'verified';
  
  // Use provided V.I.B.E. score or generate mock
  const vibe = vibeScore || generateMockVibe(profile.displayName);
  const tierConfig = VIBE_TIERS[vibe.tier];
  const personality = PERSONALITY_PROFILES[vibe.personalityType];

  return (
    <div 
      onClick={onClick}
      className={`
        group relative overflow-hidden rounded-2xl cursor-pointer
        bg-carbon-800 border border-carbon-700 
        hover:border-locale-blue hover:shadow-xl hover:shadow-locale-blue/10
        transition-all duration-300
        ${compact ? 'p-4' : 'p-6'}
      `}
    >
      {/* Pro Tier Gold Overlay */}
      {isPro && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-yellow-600 to-amber-500 text-white text-[10px] font-bold rounded-full shadow-lg">
            PRO
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-0 flex flex-col h-full">
        {/* Header: Avatar + V.I.B.E. Score */}
        <div className="flex items-start justify-between mb-4">
          {/* Avatar with Verification */}
          <div className="relative">
            <img 
              src={profile.avatarUrl || '/assets/verified-badge.png'} 
              alt={profile.displayName}
              className={`
                ${compact ? 'w-14 h-14' : 'w-16 h-16'} 
                rounded-xl object-cover 
                border-2 border-carbon-600 group-hover:border-locale-blue 
                transition-colors
              `}
            />
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-carbon-800">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>

          {/* Right Side: V.I.B.E. Score + Stage */}
          <div className="flex flex-col items-end gap-2">
            {/* V.I.B.E. Score Badge */}
            {showVibe && (
              <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border"
                style={{ 
                  borderColor: getScoreColor(vibe.total) + '50',
                  backgroundColor: getScoreColor(vibe.total) + '15'
                }}
              >
                <span 
                  className="text-xl font-black" 
                  style={{ color: getScoreColor(vibe.total) }}
                >
                  {vibe.total}
                </span>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider leading-tight">V.I.B.E.</span>
                  <span 
                    className="text-[9px] font-medium leading-tight"
                    style={{ color: tierConfig.color }}
                  >
                    {tierConfig.label.split(' ')[0]}
                  </span>
                </div>
              </div>
            )}
            
            {/* Stage Badge */}
            <div className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${stageConfig.bg} ${stageConfig.color}`}>
              {stageConfig.label}
            </div>
          </div>
        </div>

        {/* Display Name */}
        <h3 className="text-lg font-bold text-white group-hover:text-locale-blue transition-colors mb-1">
          {profile.displayName}
        </h3>

        {/* Title */}
        <p className="text-sm text-locale-blue font-medium mb-2">
          {profile.title}
        </p>

        {/* Personality Type (new) */}
        {showVibe && (
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-md bg-green-500/20 text-green-400 text-xs font-bold flex items-center justify-center">
              {vibe.personalityType}
            </span>
            <span className="text-xs text-gray-400">{personality.name}</span>
          </div>
        )}

        {/* Bio (optional for compact) */}
        {!compact && profile.bio && (
          <p className="text-sm text-gray-400 line-clamp-2 mb-4">
            {profile.bio}
          </p>
        )}

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mt-auto">
          {skills.map(skill => (
            <span 
              key={skill} 
              className="px-2 py-1 text-xs bg-carbon-700 text-gray-300 rounded border border-carbon-600"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-carbon-700">
          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{profile.location || 'Remote'}</span>
          </div>

          {/* Jobs Completed */}
          <div className="text-xs text-gray-400 font-medium">
            {profile.jobsCompleted || 0} Jobs
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalCard;
