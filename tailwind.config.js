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
    },
  },
  plugins: [],
}
