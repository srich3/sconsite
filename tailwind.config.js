/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'fantasy': {
          50: '#faf7ff',
          100: '#f4efff',
          200: '#ebe2ff',
          300: '#d9c7ff',
          400: '#c19fff',
          500: '#a474ff',
          600: '#8b4ff7',
          700: '#7c3aed',
          800: '#6d28d9',
          900: '#5b21b6',
          950: '#1a1625',
        },
        'midnight': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      fontFamily: {
        'fantasy': ['Cinzel', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'fantasy-gradient': 'linear-gradient(135deg, #1a1625 0%, #0f172a 100%)',
      }
    },
  },
  plugins: [],
};