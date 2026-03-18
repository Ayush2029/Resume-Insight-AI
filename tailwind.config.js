/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'monospace'],
        body:    ['var(--font-body)',    'sans-serif'],
        mono:    ['var(--font-mono)',    'monospace'],
      },
      colors: {
        canvas: {
          950: '#0a0c10', 900: '#0d1117', 800: '#161b22',
          700: '#21262d', 600: '#30363d', 500: '#484f58', 400: '#6e7681',
        },
        lime:  { 400: '#b5f857', 500: '#9de64e', 600: '#7ec832', 700: '#5a9020' },
        amber: { 400: '#f0a500', 500: '#d4920a' },
        sky:   { 400: '#58b4f8', 500: '#3b9de6' },
        prose: { high: '#e6edf3', mid: '#8b949e', low: '#484f58', muted: '#30363d' },
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)'    },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition:  '400px 0' },
        },
        pulse2: {
          '0%, 100%': { opacity: '1'   },
          '50%':      { opacity: '0.4' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s ease both',
        shimmer:   'shimmer 1.6s infinite linear',
        pulse2:    'pulse2 2s ease-in-out infinite',
        blink:     'blink 1s step-end infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
