import type { Config } from 'tailwindcss';

/** Pitchfirst theme — see DESIGN.md (source of truth). Tokens are CSS vars so dark mode is one block. */
const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--canvas)',
        card: 'var(--card)',
        soft: 'var(--soft)',
        line: 'var(--line)',
        ink: 'var(--ink)',
        body: 'var(--body)',
        mid: 'var(--mid)',
        faint: 'var(--faint)',
        accent: {
          DEFAULT: 'var(--accent)',
          deep: 'var(--accent-deep)',
          tint: 'var(--accent-tint)',
          lite: 'var(--accent-lite)',
        },
        ok: { DEFAULT: 'var(--ok)', tint: 'var(--ok-tint)' },
        warn: { DEFAULT: 'var(--warn)', bar: 'var(--warn-bar)', tint: 'var(--warn-tint)' },
        danger: { DEFAULT: 'var(--danger)', bar: 'var(--danger-bar)', tint: 'var(--danger-tint)' },
        info: { DEFAULT: 'var(--info)', tint: 'var(--info-tint)' },
        hero: { ink: 'var(--hero-ink)', mut: 'var(--hero-mut)' },
      },
      fontFamily: {
        sans: ['"Satoshi"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Clash Display"', '"Satoshi"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: { lg: '10px', xl: '14px', '2xl': '20px' },
      boxShadow: { card: 'var(--shadow-card)', pop: 'var(--shadow-pop)' },
      transitionTimingFunction: { DEFAULT: 'cubic-bezier(0.32, 0.72, 0, 1)', brand: 'cubic-bezier(0.32, 0.72, 0, 1)' },
      letterSpacing: { tightest: '-0.04em', tighter: '-0.03em' },
    },
  },
  plugins: [],
};

export default config;
