/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        imperial: {
          900: '#0d1525',
          800: '#1a2744',
          700: '#243557',
          600: '#2f4470',
        },
        gold: {
          400: '#d4b872',
          500: '#c9a962',
          600: '#b8984e',
          700: '#9c7f3d',
        },
        zone: {
          main: '#c9a962',
          guest: '#e8d5b7',
          exhibition: '#722f37',
          horse: '#3d5a45',
          marina: '#2e5e8b',
        },
        alert: {
          high: '#dc3545',
          medium: '#fd7e14',
          low: '#ffc107',
        }
      },
      fontFamily: {
        display: ['"Noto Serif SC"', 'serif'],
        body: ['"Noto Sans SC"', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(201, 169, 98, 0.3)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-gold': 'pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slide-in 0.4s ease-out',
        'float-up': 'float-up 0.6s ease-out',
      },
      keyframes: {
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201, 169, 98, 0.7)' },
          '50%': { boxShadow: '0 0 0 12px rgba(201, 169, 98, 0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'float-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
