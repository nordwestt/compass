/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}","./src/**/*.{js,jsx,ts,tsx}" ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        background: 'var(--background)',
        surface: 'var(--surface)',
        text: 'var(--text)',
        border: 'var(--border)',
      },
      rotate: {
        '180': '180deg',
      },
      animation: {
        'spin-once': 'spin 2s ease-in-out',
      },
      keyframes: {
        spin: {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(180deg)' },
        },
        hover: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-16px)' },
        },
      }
    },
  },
  plugins: [],
  darkMode: 'class'
}

