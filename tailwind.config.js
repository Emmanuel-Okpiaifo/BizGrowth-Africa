/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#DC2626", // Brand red accent
        brandBlue: "#0067FF",
        black: "#000000",
        white: "#FFFFFF",
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
}
