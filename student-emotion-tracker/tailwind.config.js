/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'glitter': 'glitter 1.5s ease-in-out infinite alternate',
        'fadeIn': 'fadeIn 0.5s ease-in-out',
        'slideIn': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        glitter: {
          '0%': { opacity: '0.5', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1.2)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      colors: {
        'glitter-gold': '#FFD700',
        'glitter-silver': '#C0C0C0',
        'glitter-pink': '#FFB6C1',
        'glitter-blue': '#87CEEB',
      },
    },
  },
  plugins: [],
}