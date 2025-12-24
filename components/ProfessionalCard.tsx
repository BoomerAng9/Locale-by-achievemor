/**
 * ProfessionalCard - Clean, Customizable Profile Card
 * 
 * A modern, professional card design that users can customize.
 * NOT an RPG card - clean typography with Locale branding.
 * 
 * Fields: Avatar, Display Name, Stage Badge, Skills, Rate, Verification
 * Design: Carbon-800 background, Locale-Blue accents, clean typography
 */

import React from 'react';
import { Profile, ProgressionStage } from '../types';

interface ProfessionalCardProps {
  profile: Profile;
  onClick?: () => void;
  showRate?: boolean;
  isPro?: boolean;  // Show gold overlay for Pro tier
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

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({ 
  profile, 
  onClick, 
  showRate = true,
  isPro = false,
  compact = false,
}) => {
  const stage = profile.stage || 'garage';
  const stageConfig = STAGE_CONFIG[stage];
  const skills = profile.skills?.slice(0, 4) || [];
  const isVerified = profile.verificationStatus === 'verified';

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
          <div 
            className="absolute top-0 right-0 w-32 h-32 opacity-20"
            style={{
              backgroundImage: 'url(/assets/gold-overlay.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              mixBlendMode: 'overlay',
            }}
          />
          <div className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-yellow-600 to-amber-500 text-white text-[10px] font-bold rounded-full shadow-lg">
            PRO
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-0 flex flex-col h-full">
        {/* Header: Avatar + Stage Badge + Rate */}
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
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-locale-blue rounded-full flex items-center justify-center border-2 border-carbon-800">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>

          {/* Right Side: Stage + Rate */}
          <div className="flex flex-col items-end gap-2">
            {/* Stage Badge */}
            <div className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${stageConfig.bg} ${stageConfig.color}`}>
              {stageConfig.label}
            </div>
            
            {/* Rate */}
            {showRate && profile.hourlyRate && (
              <div className="text-right">
                <span className="text-xl font-bold text-white">${profile.hourlyRate}</span>
                <span className="text-xs text-gray-500">/hr</span>
              </div>
            )}
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
