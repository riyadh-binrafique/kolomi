/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        game: {
          blue: '#1992E3',
          yellow: '#FDB813',
          darkYellow: '#E69E00',
          orange: '#FF8A00',
          board: '#805B3A',
          boardLight: '#A47547',
          success: '#10B981',
          danger: '#EF4444'
        }
      },
      fontFamily: {
        comic: ['"Fredoka"', '"Comic Sans MS"', '"Chalkboard SE"', 'cursive', 'sans-serif'],
      },
      boxShadow: {
        'game-btn': '0 6px 0 rgba(0, 0, 0, 0.25), 0 8px 12px rgba(0,0,0,0.2)',
        'game-btn-pressed': '0 2px 0 rgba(0, 0, 0, 0.25), 0 4px 6px rgba(0,0,0,0.2)',
        'modal': '0 12px 28px rgba(0,0,0,0.4)',
        'glow-green': '0 0 25px rgba(34, 197, 94, 0.7)',
        'glow-red': '0 0 25px rgba(239, 68, 68, 0.7)',
      }
    },
  },
  plugins: [],
}
