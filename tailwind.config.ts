import type { Config } from 'tailwindcss'

/**
 * Design Token System — Sho8lana
 *
 * Spacing: 8px base grid  (Tailwind unit 2 = 8px, 4 = 16px, 6 = 24px …)
 * Type scale: Major-Third ratio (1.25) anchored at 16px base
 * Colors: Semantic tokens mapped to Tailwind palettes
 */
const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    // ── 8-px grid: override default spacing to lock every step to 8px ──
    spacing: {
      px: '1px',
      0: '0',
      0.5: '2px',
      1: '4px',   // half-step (for tight gaps)
      2: '8px',   // base
      3: '12px',
      4: '16px',
      5: '20px',
      6: '24px',
      7: '28px',
      8: '32px',
      9: '36px',
      10: '40px',
      11: '44px',
      12: '48px',
      14: '56px',
      16: '64px',
      20: '80px',
      24: '96px',
      28: '112px',
      32: '128px',
      36: '144px',
      40: '160px',
      48: '192px',
      56: '224px',
      64: '256px',
      72: '288px',
      80: '320px',
      96: '384px',
    },
    // ── Type scale: Major-Third (×1.25) from 12px → 60px ──
    fontSize: {
      '2xs': ['11px', { lineHeight: '1.5', letterSpacing: '0.02em' }],
      xs:   ['12px', { lineHeight: '1.5', letterSpacing: '0.01em' }],
      sm:   ['14px', { lineHeight: '1.5' }],
      base: ['16px', { lineHeight: '1.6' }],
      lg:   ['18px', { lineHeight: '1.5' }],
      xl:   ['20px', { lineHeight: '1.4' }],
      '2xl':['24px', { lineHeight: '1.35' }],
      '3xl':['30px', { lineHeight: '1.3' }],
      '4xl':['36px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      '5xl':['48px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      '6xl':['60px', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
    },
    extend: {
      colors: {
        // ── Brand (Teal) — primary actions, nav active, CTAs ──
        brand: {
          50:  '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488', // PRIMARY
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
          950: '#042F2E',
        },
        // ── Neutral (Slate) — text, borders, surfaces ──
        neutral: {
          0:   '#FFFFFF',
          50:  '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        // ── Accent: Warning (Amber) ──
        warning: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        // ── Accent: Success (Emerald) ──
        success: {
          50:  '#ECFDF5',
          100: '#D1FAE5',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        // ── Accent: Danger (Rose) ──
        danger: {
          50:  '#FFF1F2',
          100: '#FFE4E6',
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
        },
        // ── Accent: Info / AI (Violet) ──
        violet: {
          50:  '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          900: '#4C1D95',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['DM Serif Display', 'serif'],
        arabic: ['Noto Kufi Arabic', 'Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm:  '6px',
        DEFAULT: '8px',
        md:  '10px',
        lg:  '12px',
        xl:  '16px',
        '2xl': '20px',
        '3xl': '24px',
        full: '9999px',
      },
      boxShadow: {
        xs:  '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        sm:  '0 1px 3px 0 rgb(0 0 0 / 0.10), 0 1px 2px -1px rgb(0 0 0 / 0.10)',
        md:  '0 4px 6px -1px rgb(0 0 0 / 0.10), 0 2px 4px -2px rgb(0 0 0 / 0.10)',
        lg:  '0 10px 15px -3px rgb(0 0 0 / 0.10), 0 4px 6px -4px rgb(0 0 0 / 0.10)',
        xl:  '0 20px 25px -5px rgb(0 0 0 / 0.10), 0 8px 10px -6px rgb(0 0 0 / 0.10)',
        card: '0 0 0 1px rgb(0 0 0 / 0.06), 0 2px 8px rgb(0 0 0 / 0.06)',
        'card-hover': '0 0 0 1px rgb(0 0 0 / 0.08), 0 4px 20px rgb(0 0 0 / 0.10)',
        glow: '0 0 24px rgb(13 148 136 / 0.35)',
        'glow-violet': '0 0 24px rgb(124 58 237 / 0.35)',
      },
      keyframes: {
        spotlight: {
          '0%':   { opacity: '0', transform: 'translate(-72%, -62%) scale(0.5)' },
          '100%': { opacity: '1', transform: 'translate(-50%, -40%) scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
      },
      animation: {
        spotlight: 'spotlight 2s ease forwards',
        shimmer: 'shimmer 2s linear infinite',
        pulse: 'pulse 1.5s ease-in-out infinite',
      },
      maxWidth: {
        app: '430px',
      },
      height: {
        dvh: '100dvh',
      },
      minHeight: {
        dvh: '100dvh',
      },
    },
  },
  plugins: [],
}

export default config
