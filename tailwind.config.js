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
        primary: "#0067FF", // User preferred primary
        black: "#000000",
        white: "#FFFFFF",
      },
    },
  },
  plugins: [],
}
