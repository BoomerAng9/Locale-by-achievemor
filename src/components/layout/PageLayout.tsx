/**
 * PageLayout Component
 * 
 * Provides consistent styling across all pages.
 * Wraps page content with standard header, footer, and layout structure.
 */

import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  showHero?: boolean;
  heroBackground?: 'gradient' | 'glow' | 'minimal';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className = '',
  title,
  subtitle,
  showHero = false,
  heroBackground = 'gradient',
  maxWidth = '7xl',
  padding = 'md',
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4 py-4',
    md: 'px-4 sm:px-6 lg:px-8 py-8',
    lg: 'px-6 sm:px-8 lg:px-12 py-12',
  };

  return (
    <div className={`min-h-screen bg-carbon-900 ${className}`}>
      {/* Optional Hero Section */}
      {showHero && title && (
        <div className="relative overflow-hidden">
          {/* Background Effects */}
          {heroBackground === 'gradient' && (
            <div className="absolute inset-0 bg-linear-to-br from-carbon-900 via-carbon-800 to-carbon-900" />
          )}
          {heroBackground === 'glow' && (
            <>
              <div className="absolute inset-0 bg-carbon-900" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-locale-blue/10 rounded-full blur-[100px]" />
            </>
          )}
          
          {/* Hero Content */}
          <div className={`relative ${maxWidthClasses[maxWidth]} mx-auto ${paddingClasses[padding]}`}>
            <div className="py-16 md:py-24 text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4 animate-fade-in-up">
                {title}
              </h1>
              {subtitle && (
                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page Content */}
      <main className={`${maxWidthClasses[maxWidth]} mx-auto ${paddingClasses[padding]}`}>
        {children}
      </main>
    </div>
  );
};

/**
 * Section Component for consistent section styling
 */
interface SectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  background?: 'default' | 'alt' | 'gradient';
}

export const Section: React.FC<SectionProps> = ({
  children,
  className = '',
  title,
  subtitle,
  background = 'default',
}) => {
  const bgClasses = {
    default: '',
    alt: 'bg-carbon-800/50',
    gradient: 'bg-linear-to-b from-carbon-800/50 to-transparent',
  };

  return (
    <section className={`py-12 md:py-16 ${bgClasses[background]} ${className}`}>
      {(title || subtitle) && (
        <div className="mb-8 md:mb-12">
          {title && (
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{title}</h2>
          )}
          {subtitle && (
            <p className="text-gray-400 max-w-2xl">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
};

/**
 * Card Component for consistent card styling
 */
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'glass' | 'outline' | 'glow';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  variant = 'default',
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantClasses = {
    default: 'bg-carbon-800 border border-carbon-700',
    glass: 'glass-panel',
    outline: 'bg-transparent border-2 border-carbon-700',
    glow: 'bg-carbon-800 border border-locale-blue/30 shadow-lg shadow-locale-blue/10',
  };

  const hoverClass = hover
    ? 'hover:border-locale-blue/50 hover:shadow-lg hover:shadow-locale-blue/10 transition-all duration-300 cursor-pointer'
    : '';

  return (
    <div className={`rounded-2xl ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClass} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Grid Component for consistent grid layouts
 */
interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

export const Grid: React.FC<GridProps> = ({
  children,
  className = '',
  cols = 3,
  gap = 'md',
}) => {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  return (
    <div className={`grid ${colClasses[cols]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Button Component for consistent button styling
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-locale-blue hover:bg-locale-darkBlue text-white shadow-lg shadow-locale-blue/20 hover:shadow-locale-blue/40',
    secondary: 'bg-carbon-700 hover:bg-carbon-600 text-white border border-carbon-600',
    ghost: 'text-locale-blue hover:text-white hover:bg-locale-blue/10',
    outline: 'border-2 border-locale-blue text-locale-blue hover:bg-locale-blue hover:text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  const sizeClasses = {
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2.5 px-5 text-sm',
    lg: 'py-3 px-6 text-base',
  };

  return (
    <button
      className={`font-bold rounded-lg transition-all duration-200 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * Badge Component
 */
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
}) => {
  const variantClasses = {
    success: 'bg-green-500/10 text-green-400 border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    neutral: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium border ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {children}
    </span>
  );
};

export default PageLayout;
