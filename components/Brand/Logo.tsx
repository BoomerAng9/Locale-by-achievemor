
import React from 'react';

interface LogoProps {
  className?: string;
  useImage?: boolean;
  showText?: boolean;
  variant?: 'default' | 'avatar';
}

export const LocaleLogo: React.FC<LogoProps> = ({ 
  className = "h-10", 
  useImage = true, 
  showText = true,
  variant = 'default'
}) => {
  const isAvatar = variant === 'avatar';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {useImage ? (
         <div className={`relative group ${isAvatar ? 'h-full aspect-square' : ''}`}>
            {!isAvatar && (
               <div className="absolute -inset-1 bg-linear-to-r from-locale-blue to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            )}
            <img 
              src="/assets/locale-logo.png" 
              alt="LOCALE by: ACHIEVEMOR Logo" 
              className={`relative object-contain ${isAvatar ? 'h-full w-full rounded-full object-cover border border-gray-700' : 'h-12 w-auto rounded'}`}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback');
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            {/* Fallback if image fails */}
            <div className={`logo-fallback hidden relative flex items-center justify-center bg-carbon-800 border border-carbon-600 ${isAvatar ? 'w-full h-full rounded-full' : 'w-12 h-12 rounded-lg transform -skew-x-6'}`}>
              <span className="text-locale-blue font-black text-xl">L</span>
            </div>
         </div>
      ) : (
        <div className={`relative flex items-center justify-center bg-carbon-800 border border-carbon-600 hover:skew-x-0 transition-transform duration-300 shadow-glow ${isAvatar ? 'w-full h-full rounded-full' : 'w-10 h-10 transform -skew-x-12'}`}>
          <div className="absolute inset-0 bg-locale-blue opacity-20"></div>
          <svg className="w-6 h-6 text-locale-blue relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      )}
      
      {showText && (
        <div className="flex flex-col justify-center h-full">
          <h1 className="text-2xl font-black tracking-tighter text-white leading-none font-sans italic drop-shadow-md">
            LOCALE
          </h1>
          <span className="text-[10px] font-mono text-locale-blue tracking-[0.3em] font-bold ml-0.5">
            by: ACHIEVEMOR
          </span>
        </div>
      )}
    </div>
  );
};
