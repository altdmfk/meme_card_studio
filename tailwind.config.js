/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#059669', // emerald-600
          hover: '#047857',   // emerald-700
          light: '#10b981',   // emerald-500
        }
      },
      fontFamily: {
        sans: ['Inter', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        impact: ['Impact', 'Haettenschweiler', 'Arial Narrow Bold', 'sans-serif'],
        anton: ['Anton', 'sans-serif'],
        bangers: ['Bangers', 'cursive'],
        blackhan: ['"Black Han Sans"', 'sans-serif'],
        dohyeon: ['"Do Hyeon"', 'sans-serif'],
        jua: ['Jua', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
        marker: ['"Permanent Marker"', 'cursive'],
        caveat: ['Caveat', 'cursive'],
        notokr: ['"Noto Sans KR"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
