/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
        doto: ['Doto', 'monospace'], // Tech accent font for headings + data
      },
      colors: {
        // Apple Glass Base Palette
        glass: {
          50: '#FFFFFF', // Pure white (backgrounds)
          100: '#F9FAFB', // Off-white
          200: '#F3F4F6', // Light gray
          300: '#E5E7EB', // Subtle gray
          400: '#D1D5DB', // Medium gray
          500: '#9CA3AF', // Darker gray
          600: '#6B7280', // Medium-dark gray
          700: '#4B5563', // Dark gray (text)
          800: '#1F2937', // Very dark (alt backgrounds)
          900: '#0F1419', // Near black
          950: '#0A0A0A', // Pure black
        },
        // Accent colors (minimal, clean)
        accent: {
          primary: '#3B82F6', // Clean blue (focus states, accents)
          secondary: '#8B5CF6', // Subtle purple
          success: '#10B981', // Green (positive states)
          warning: '#F59E0B', // Amber (warnings)
          danger: '#EF4444', // Red (errors only - NOT primary)
          neutral: '#6B7280', // Gray (secondary UI)
        },
        // Deprecated - DO NOT USE
        // (keeping for search/replace safety)
        carbon: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#121212',
          950: '#0A0A0A',
        },
        locale: {
          blue: '#3B82F6', // Changed from red to blue
          darkBlue: '#1E40AF',
          lightBlue: '#93C5FD',
        },
        sockeye: {
          red: '#3B82F6', // Deprecated, use accent.primary
          dark: '#0F1419',
          panel: '#F9FAFB',
        },
      },
      backgroundColor: {
        'glass-light': 'rgba(255, 255, 255, 0.8)',
        'glass-dark': 'rgba(15, 20, 25, 0.95)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '12px',
        md: '16px',
        lg: '20px',
        xl: '40px',
      },
      animation: {
        'spin-slow': 'spin 10s linear infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'slide-right': 'slide-right 1s ease-out forwards',
        'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-right': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'glass-inner': 'inset 0 2px 4px rgba(255, 255, 255, 0.1)',
        'glow-blue': '0 0 20px -5px rgba(59, 130, 246, 0.5)',
        'glow-purple': '0 0 20px -5px rgba(139, 92, 246, 0.5)',
      },
      borderRadius: {
        'glass': '12px',
      },
      opacity: {
        glass: '0.8',
      },
    },
  },
  plugins: [],
}
