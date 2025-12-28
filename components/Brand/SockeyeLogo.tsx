/**
 * Sockeye Logo Component
 * Minimal "nothing brand" style with DotGothic16 font
 * No external icon libraries - pure CSS
 */

import React from 'react';

interface SockeyeLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const SockeyeLogo: React.FC<SockeyeLogoProps> = ({ size = 'md', showText = true }) => {
  const sizes = {
    sm: { box: 'w-8 h-8', icon: 'text-sm', title: 'text-xs', sub: 'text-[8px]' },
    md: { box: 'w-10 h-10', icon: 'text-base', title: 'text-sm', sub: 'text-[9px]' },
    lg: { box: 'w-14 h-14', icon: 'text-xl', title: 'text-lg', sub: 'text-xs' },
  };

  const s = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <div className={`${s.box} rounded-lg bg-linear-to-br from-red-600 to-red-800 flex items-center justify-center text-red-200 ${s.icon}`}>
        ⟨◊⟩
      </div>
      {showText && (
        <div>
          <h1 className={`font-dots ${s.title} text-red-500 text-glow-red tracking-widest`}>SOCKEYE</h1>
          <p className={`font-dots ${s.sub} text-red-500/50 tracking-[0.2em]`}>FINANCIAL</p>
        </div>
      )}
    </div>
  );
};

export default SockeyeLogo;
