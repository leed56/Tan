/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'soma-dark': '#0A0E27',
        'soma-dark-2': '#131936',
        'soma-dark-3': '#1C2347',
        'soma-primary': '#7B6FF2',
        'soma-primary-light': '#9B8CF9',
        'soma-secondary': '#4A90D9',
        'soma-gold': '#F7C52E',
        'soma-gold-light': '#FFD700',
        'soma-success': '#4ECDC4',
        'soma-error': '#FF6B6B',
        'soma-text': '#FFFFFF',
        'soma-text-secondary': '#B0BAD3',
        'soma-text-muted': '#6B7499',
      },
    },
  },
  plugins: [],
};
