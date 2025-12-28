/**
 * NURD Profile Card Component
 * Template for user profile cards - C1 Thesys clones this design
 * Users can customize their profile image for $3 add-on
 */

import React from 'react';

export interface ProfileCardData {
    name: string;
    className: string;
    level: number;
    coreTrait: string;
    vibeAbility: string;
    nurdSyncStatus: 'ACTIVE' | 'SYNCING' | 'OFFLINE';
    bio: string;
    imageUrl?: string;
    isCustomImage?: boolean;
}

interface ProfileCardProps {
    profile: ProfileCardData;
    onConnect?: () => void;
    onDraft?: () => void;
    onCustomizeImage?: () => void;
    editable?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ 
    profile, 
    onConnect, 
    onDraft,
    onCustomizeImage,
    editable = false 
}) => {
    const defaultImage = 'https://via.placeholder.com/300x350/1a1a2e/00ff88?text=NURD';
    
    return (
        <div className="relative w-72 aspect-[3/4] rounded-2xl overflow-hidden bg-linear-to-b from-[#0a1628] to-[#0d0d1a] border-4 border-[#00d4ff] shadow-[0_0_30px_rgba(0,212,255,0.3),inset_0_0_30px_rgba(0,212,255,0.1)]">
            {/* Outer Frame Glow */}
            <div className="absolute inset-1 rounded-xl border border-[#00d4ff]/30" />
            
            {/* Name Tag */}
            <div className="absolute top-4 left-4 right-4 z-10">
                <div className="bg-linear-to-r from-[#ff6b35] to-[#d94a26] rounded-lg px-4 py-2 border-2 border-[#ff8c5a] shadow-lg">
                    <span className="font-bold text-white text-lg tracking-wide">{profile.name || 'NAME'}</span>
                </div>
            </div>

            {/* Character Image */}
            <div className="absolute inset-0 flex items-center justify-center pt-16 pb-40">
                <div className="relative w-full h-full flex items-center justify-center">
                    <img 
                        src={profile.imageUrl || defaultImage}
                        alt={profile.name}
                        className="max-w-full max-h-full object-contain"
                    />
                    {/* Glow Ring Effect */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-linear-to-t from-[#ff6b00] to-transparent rounded-full blur-xl opacity-80" />
                </div>

                {/* Edit Image Button (if editable) */}
                {editable && (
                    <button 
                        onClick={onCustomizeImage}
                        className="absolute top-20 right-4 bg-purple-600 hover:bg-purple-500 text-white text-xs px-2 py-1 rounded-lg shadow-lg"
                    >
                        ✏️ Edit ($3)
                    </button>
                )}
            </div>

            {/* Stats Panel */}
            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-[#0a1628] via-[#0a1628] to-transparent pt-16 pb-4 px-4">
                {/* Class & Level Row */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-[#00d4ff] text-xs uppercase font-bold">Class</span>
                        <span className="bg-[#1a2744] border border-[#00d4ff]/30 rounded px-3 py-1 text-white font-bold text-sm">
                            {profile.className || 'TECH SAGE'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[#00d4ff] text-xs uppercase font-bold">Level</span>
                        <span className="bg-[#1a2744] border border-[#00d4ff]/30 rounded px-3 py-1 text-white font-bold text-sm">
                            {profile.level || 1}
                        </span>
                    </div>
                </div>

                {/* Trait & Ability Row */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                        <span className="text-[#ff6b35] text-[10px] uppercase font-bold block">Core Trait</span>
                        <span className="text-white font-bold text-xs">{profile.coreTrait || 'VITALITY'}</span>
                    </div>
                    <div>
                        <span className="text-[#ff6b35] text-[10px] uppercase font-bold block">Vibe Ability</span>
                        <span className="text-white font-bold text-xs">{profile.vibeAbility || 'KINETIC FITNESS'}</span>
                    </div>
                </div>

                {/* NURD Sync Status */}
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#00d4ff] text-[10px] uppercase font-bold">NURD Sync Status</span>
                    <span className={`font-bold text-xs ${
                        profile.nurdSyncStatus === 'ACTIVE' ? 'text-green-400' :
                        profile.nurdSyncStatus === 'SYNCING' ? 'text-yellow-400' : 'text-gray-500'
                    }`}>
                        {profile.nurdSyncStatus || 'ACTIVE'}
                    </span>
                </div>

                {/* Bio */}
                <p className="text-gray-400 text-[10px] italic mb-3 line-clamp-2">
                    {profile.bio || 'A young innovator with boundless energy, always seeking the next big idea.'}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button 
                        onClick={onConnect}
                        className="flex-1 bg-[#1a2744] hover:bg-[#2a3754] border border-[#00d4ff]/30 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                    >
                        TAP TO CONNECT
                    </button>
                    <button 
                        onClick={onDraft}
                        className="flex-1 bg-linear-to-r from-[#ff6b35] to-[#d94a26] hover:from-[#ff8c5a] hover:to-[#e05a36] text-white text-xs font-bold py-2 rounded-lg transition-colors"
                    >
                        SWIPE TO DRAFT
                    </button>
                </div>
            </div>

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00d4ff]" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00d4ff]" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00d4ff]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00d4ff]" />
        </div>
    );
};

// Default export for standard card
export default ProfileCard;

// Export a gallery of sample cards
export const SampleProfiles: ProfileCardData[] = [
    {
        name: 'ALEX NURD',
        className: 'TECH SAGE',
        level: 7,
        coreTrait: 'VITALITY',
        vibeAbility: 'KINETIC FITNESS',
        nurdSyncStatus: 'ACTIVE',
        bio: 'A young innovator with boundless energy, always seeking the next big idea.',
    },
    {
        name: 'MAYA CODE',
        className: 'ARCHITECT',
        level: 12,
        coreTrait: 'WISDOM',
        vibeAbility: 'SYSTEM DESIGN',
        nurdSyncStatus: 'ACTIVE',
        bio: 'Master of complex systems and elegant solutions.',
    },
    {
        name: 'ZERO STACK',
        className: 'DEBUGGER',
        level: 5,
        coreTrait: 'FOCUS',
        vibeAbility: 'BUG HUNTER',
        nurdSyncStatus: 'SYNCING',
        bio: 'No bug can hide from the relentless pursuit of clean code.',
    },
];
