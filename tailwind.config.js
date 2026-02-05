/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        track: {
          50: '#FEF2EF',
          100: '#FDE0D9',
          200: '#FBC0B2',
          300: '#F69578',
          400: '#E8613D',
          500: '#D94F30',
          600: '#C04229',
          700: '#A93B24',
          800: '#7A2B1A',
          900: '#5C2115',
        },
        surface: {
          light: '#FAF7F4',
          DEFAULT: '#FFFFFF',
          dark: '#111318',
          'dark-card': '#1A1D27',
          'dark-card-alt': '#1F2230',
        },
      },
    },
  },
  plugins: [],
}
