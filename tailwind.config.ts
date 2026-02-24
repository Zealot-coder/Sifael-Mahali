import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        surfaceAlt: 'rgb(var(--surface-alt) / <alpha-value>)',
        text: 'rgb(var(--text) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        brand: 'rgb(var(--brand) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)'
      },
      fontFamily: {
        sans: ['var(--font-space)', 'ui-sans-serif', 'system-ui'],
        display: ['var(--font-sora)', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        glow: '0 0 0 1px rgb(var(--line) / 0.35), 0 24px 64px -28px rgb(var(--brand) / 0.45)'
      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      animation: {
        drift: 'drift 8s ease-in-out infinite'
      },
      backgroundImage: {
        'hero-grid':
          'linear-gradient(to right, rgb(var(--line) / 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--line) / 0.08) 1px, transparent 1px)'
      }
    }
  },
  plugins: []
};

export default config;
