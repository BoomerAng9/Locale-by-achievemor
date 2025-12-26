/**
 * Theme Configuration
 * 
 * Central theme system for consistent styling across all pages.
 * Matches the professional landing page design.
 */

// Color palette
export const colors = {
  // Primary brand colors
  locale: {
    blue: '#3B82F6',
    lightBlue: '#60A5FA',
    darkBlue: '#1D4ED8',
  },
  
  // Carbon scale (dark mode)
  carbon: {
    900: '#121212',  // Darkest - main background
    800: '#1A1D21',  // Cards, panels
    700: '#2A2D31',  // Borders, dividers
    600: '#3A3D41',  // Hover states
    500: '#4A4D51',  // Muted elements
  },
  
  // Status colors
  status: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#9CA3AF',
    muted: '#6B7280',
    disabled: '#4B5563',
  },
  
  // Accent colors for industries
  industry: {
    realEstate: '#10B981',  // Emerald
    legal: '#64748B',       // Slate
    construction: '#F97316', // Orange
    healthcare: '#06B6D4',   // Cyan
    retail: '#EC4899',       // Pink
    logistics: '#2563EB',    // Blue
    education: '#EAB308',    // Yellow
    media: '#A855F7',        // Purple
    hospitality: '#F43F5E',  // Rose
    tech: '#6366F1',         // Indigo
  },
};

// Typography scale
export const typography = {
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
  },
  
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },
};

// Spacing scale
export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
};

// Border radius
export const borderRadius = {
  none: '0',
  sm: '0.25rem',
  default: '0.5rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
};

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  default: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  glow: '0 0 20px -5px rgba(59, 130, 246, 0.5)',
  glowStrong: '0 0 40px -10px rgba(59, 130, 246, 0.7)',
};

// Animations
export const animations = {
  fadeInUp: 'animate-fade-in-up',
  slideRight: 'animate-slide-right',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  ping: 'animate-ping',
};

// Common component styles (as Tailwind class strings)
export const componentStyles = {
  // Page containers
  pageContainer: 'min-h-screen bg-carbon-900',
  pageContent: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
  
  // Cards
  card: 'bg-carbon-800 border border-carbon-700 rounded-2xl',
  cardHover: 'hover:border-locale-blue/50 hover:shadow-lg hover:shadow-locale-blue/10 transition-all duration-300',
  glassCard: 'glass-panel rounded-2xl backdrop-blur-md',
  
  // Headers
  pageHeader: 'text-4xl md:text-5xl font-black text-white tracking-tight',
  sectionHeader: 'text-2xl md:text-3xl font-bold text-white',
  cardHeader: 'text-lg font-bold text-white',
  
  // Text
  bodyText: 'text-gray-400 leading-relaxed',
  mutedText: 'text-gray-500 text-sm',
  labelText: 'text-xs uppercase tracking-wider text-gray-500 font-medium',
  
  // Buttons
  primaryButton: 'bg-locale-blue hover:bg-locale-darkBlue text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg shadow-locale-blue/20 hover:shadow-locale-blue/40',
  secondaryButton: 'bg-carbon-700 hover:bg-carbon-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 border border-carbon-600',
  ghostButton: 'text-locale-blue hover:text-white hover:bg-locale-blue/10 font-medium py-2 px-4 rounded-lg transition-all duration-200',
  outlineButton: 'border-2 border-locale-blue text-locale-blue hover:bg-locale-blue hover:text-white font-medium py-2 px-4 rounded-lg transition-all duration-200',
  
  // Inputs
  input: 'w-full bg-carbon-900 border border-carbon-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-locale-blue focus:ring-1 focus:ring-locale-blue focus:outline-none transition-all duration-200',
  
  // Badges
  badge: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  badgeSuccess: 'bg-green-500/10 text-green-400 border border-green-500/20',
  badgeWarning: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  badgeError: 'bg-red-500/10 text-red-400 border border-red-500/20',
  badgeInfo: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  
  // Navigation
  navLink: 'text-gray-400 hover:text-white font-medium transition-colors',
  navLinkActive: 'text-white font-medium',
  
  // Sections
  section: 'py-16 md:py-24',
  sectionDivider: 'border-t border-carbon-700',
  
  // Grids
  gridCols2: 'grid grid-cols-1 md:grid-cols-2 gap-6',
  gridCols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  gridCols4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
};

// Hero section styles
export const heroStyles = {
  container: 'relative min-h-[60vh] flex items-center justify-center overflow-hidden',
  background: 'absolute inset-0 bg-gradient-to-br from-carbon-900 via-carbon-800 to-carbon-900',
  content: 'relative z-10 text-center max-w-4xl mx-auto px-4',
  title: 'text-5xl md:text-7xl font-black text-white tracking-tight mb-6',
  subtitle: 'text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-8',
  glow: 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-locale-blue/20 rounded-full blur-3xl',
};

// Export everything as default theme object
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  componentStyles,
  heroStyles,
};

export default theme;
