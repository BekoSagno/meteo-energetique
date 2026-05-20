/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#F9F9F7',
        'brand-dark': '#004B2B',
        'brand-green': '#10B981',
        'brand-red': '#C1121F',
        'brand-yellow': '#FFB703',
        'status-online': '#10B981',
        'status-offline': '#C1121F',
        'status-unstable': '#FFB703',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      fontSize: {
        'body-lg': ['1.125rem', { lineHeight: '1.7', letterSpacing: '-0.01em' }],
        'body-xl': ['1.25rem', { lineHeight: '1.65', letterSpacing: '-0.015em' }],
        'display-sm': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'display-md': ['2.375rem', { lineHeight: '1.15', letterSpacing: '-0.025em' }],
        'display-lg': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
      },
      boxShadow: {
        header: '0 2px 10px rgba(0, 75, 43, 0.18)',
        card: '0 4px 24px rgba(0, 75, 43, 0.1)',
        glow: '0 0 24px rgba(16, 185, 129, 0.35)',
        'glow-yellow': '0 0 20px rgba(255, 183, 3, 0.4)',
        'nav-hover': '0 6px 20px rgba(0, 75, 43, 0.12)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(28px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'page-enter': {
          '0%': { opacity: '0', transform: 'translateY(18px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'blur-in': {
          '0%': { opacity: '0', filter: 'blur(8px)', transform: 'translateY(12px)' },
          '100%': { opacity: '1', filter: 'blur(0)', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'text-shine': {
          '0%': { backgroundPosition: '0% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        'status-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.15)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.35)' },
          '50%': { boxShadow: '0 0 16px 4px rgba(16, 185, 129, 0.25)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slide-in-left': 'slide-in-left 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slide-in-right': 'slide-in-right 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slide-down': 'slide-down 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'page-enter': 'page-enter 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'blur-in': 'blur-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        float: 'float 5s ease-in-out infinite',
        shimmer: 'shimmer 1.8s linear infinite',
        'text-shine': 'text-shine 5s linear infinite',
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'status-pulse': 'status-pulse 2s ease-in-out infinite',
        wiggle: 'wiggle 0.4s ease-in-out',
        'glow-pulse': 'glow-pulse 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
