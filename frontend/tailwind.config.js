/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0d0d0f',
          900: '#111115',
          850: '#16161c',
          800: '#1a1a20',
          750: '#1f1f27',
          700: '#2a2a35',
          600: '#333340',
        },
        brand: {
          DEFAULT: '#f97316',
          dark: '#ea6c0a',
          light: '#fb923c',
        },
        muted: {
          DEFAULT: '#a0a0b0',
          faint: '#666680',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        brand: '0 0 24px rgba(249,115,22,0.25)',
        card: '0 4px 24px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'brand-glow': 'radial-gradient(ellipse at 70% 50%, rgba(249,115,22,0.08) 0%, transparent 70%)',
      },
      keyframes: {
        slideIn: {
          from: { transform: 'translateX(120%)' },
          to: { transform: 'translateX(0)' },
        },
        pulseDot: {
          '0%,100%': { opacity: 1 },
          '50%': { opacity: 0.3 },
        },
        fadeInUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        slideIn: 'slideIn 0.3s ease forwards',
        pulseDot: 'pulseDot 1.5s infinite',
        fadeInUp: 'fadeInUp 0.5s ease forwards',
        spin: 'spin 0.7s linear infinite',
      },
    },
  },
  plugins: [],
};
