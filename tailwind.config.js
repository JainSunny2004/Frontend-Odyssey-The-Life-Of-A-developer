import { fontFamily } from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'neon-green':    '#00ff88',
        'neon-red':      '#ff5555',
        'neon-yellow':   '#f1fa8c',
        'neon-purple':   '#bd93f9',
        'neon-blue':     '#00d4ff',
        'neon-pink':     '#ff79c6',
        'neon-orange':   '#ffb86c',

        'coffee-amber':  '#d4a017',
        'coffee-cream':  '#f5e6d3',
        'coffee-light':  '#c8a882',
        'coffee-mid':    '#8b6347',
        'coffee-dark':   '#2c1810',
        'coffee-deeper': '#1c0e08',

        'bg-void':    '#0a0a0f',
        'bg-surface': '#0d1117',
        'bg-deep':    '#080810',
        'bg-border':  '#1e2030',
        'bg-hover':   '#161b27',
      },
      fontFamily: {
        space: ['Space Grotesk', ...fontFamily.sans],
        inter: ['Inter',         ...fontFamily.sans],
        mono:  ['JetBrains Mono',...fontFamily.mono],
      },
      fontSize: {
        title: [
          'clamp(2.5rem, 5.5vw, 5rem)',
          { lineHeight: '1.04', letterSpacing: '-0.025em' },
        ],
      },
      opacity: {
        '3':  '0.03',
        '5':  '0.05',
        '6':  '0.06',
        '8':  '0.08',
        '12': '0.12',
        '15': '0.15',
        '35': '0.35',
      },
      boxShadow: {
        coffee:        '0 0 20px rgba(212,160,23,0.4), 0 0 60px rgba(212,160,23,0.15)',
        'neon-green':  '0 0 15px rgba(0,255,136,0.5),  0 0 40px rgba(0,255,136,0.15)',
        'neon-red':    '0 0 15px rgba(255,85,85,0.5),  0 0 40px rgba(255,85,85,0.15)',
        'neon-purple': '0 0 15px rgba(189,147,249,0.5),0 0 40px rgba(189,147,249,0.15)',
        'neon-blue':   '0 0 15px rgba(0,212,255,0.5),  0 0 40px rgba(0,212,255,0.15)',
        glass:         '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      animation: {
        'neon-border': 'neonBorderPulse 2.5s ease-in-out infinite',
        float:         'floatY 3.5s ease-in-out infinite',
        'spin-slow':   'spin 8s linear infinite',
      },
      keyframes: {
        neonBorderPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1'   },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0px)'   },
          '50%':      { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
