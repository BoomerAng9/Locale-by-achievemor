import React from 'react';
import { Profile, GarageStage, NurdStatus } from '../types';

interface TechSageCardProps {
  profile: Profile;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

const TechSageCard: React.FC<TechSageCardProps> = ({ profile, size = 'medium', onClick }) => {
  // Styles based on garage stage
  const getBorderColor = (stage?: GarageStage) => {
    switch (stage) {
      case GarageStage.GLOBAL: return 'border-neon-gold shadow-[0_0_15px_#FFD700]';
      case GarageStage.COMMUNITY: return 'border-neon-cyan shadow-[0_0_15px_#00FFFF]';
      case GarageStage.GARAGE: return 'border-neon-orange shadow-[0_0_15px_#FFA500]';
      default: return 'border-gray-600';
    }
  };

  const getStatusColor = (status?: NurdStatus) => {
    switch (status) {
      case NurdStatus.ACTIVE: return 'bg-green-500';
      case NurdStatus.BUSY: return 'bg-red-500';
      case NurdStatus.OFFLINE: return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const sizeClasses = size === 'large' ? 'max-w-md w-full' : 'max-w-xs w-full';

  return (
    <div 
      onClick={onClick}
      className={`relative group bg-dark-card border-2 ${getBorderColor(profile.garageStage)} rounded-xl overflow-hidden transition-transform duration-300 hover:scale-[1.02] cursor-pointer ${sizeClasses}`}
    >
      {/* Header Name Plate */}
      <div className="absolute top-0 left-0 bg-black/60 backdrop-blur border-b border-r border-gray-700 rounded-br-xl px-4 py-1 z-10">
        <span className="text-neon-orange font-bold font-mono tracking-widest uppercase text-sm">
          {profile.username || profile.displayName}
        </span>
      </div>

      {/* Main Image Area */}
      <div className="relative h-64 w-full bg-gradient-to-b from-gray-900 to-black overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <img 
          src={profile.avatarUrl} 
          alt={profile.displayName} 
          className="h-56 w-56 object-cover rounded-full border-4 border-gray-800 shadow-2xl z-10 group-hover:shadow-neon-cyan/50 transition-shadow duration-500"
        />
        {/* Holographic Glow behind avatar */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-neon-cyan/20 blur-[50px] rounded-full"></div>
      </div>

      {/* Stats Grid */}
      <div className="bg-dark-surface p-4 border-t border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-xs text-gray-500 uppercase font-bold">Class</span>
            <div className="text-neon-gold font-bold text-lg">Tech Sage</div>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500 uppercase font-bold">Level</span>
            <div className="text-white font-mono text-2xl">{profile.level || 1}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div className="bg-black/40 p-2 rounded border border-gray-800">
            <div className="text-neon-cyan text-xs font-bold">TRAIT</div>
            <div className="text-gray-300">{profile.coreTrait || 'N/A'}</div>
          </div>
          <div className="bg-black/40 p-2 rounded border border-gray-800">
            <div className="text-neon-cyan text-xs font-bold">ABILITY</div>
            <div className="text-gray-300">{profile.vibeAbility || 'N/A'}</div>
          </div>
        </div>

        {/* Sync Status */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-400 font-mono">NURD SYNC:</span>
          <div className={`w-2 h-2 rounded-full ${getStatusColor(profile.status)} animate-pulse`}></div>
          <span className="text-xs text-white uppercase">{profile.status || 'OFFLINE'}</span>
        </div>

        {/* Bio Snippet */}
        <p className="text-gray-400 text-xs italic mb-4 line-clamp-2">
          "{profile.bio}"
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-neon-cyan/10 border border-neon-cyan text-neon-cyan text-xs font-bold py-2 rounded hover:bg-neon-cyan hover:text-black transition-colors">
            TAP TO CONNECT
          </button>
          <button className="bg-neon-orange/10 border border-neon-orange text-neon-orange text-xs font-bold py-2 rounded hover:bg-neon-orange hover:text-black transition-colors">
            SWIPE TO DRAFT
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechSageCard;