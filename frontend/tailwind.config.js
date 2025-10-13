/** @type {import('tailwindcss').Config} */
export default {
  content: [
     "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          800: '#1e1e1e',
          600: '#3a3a3a',
        },
      },
    },
  },
  plugins: [],
}

