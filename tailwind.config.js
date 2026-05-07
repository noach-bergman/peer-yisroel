/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // Navy family — logo's deep heraldic midnight blue
          primary: '#162A55',
          'primary-light': '#22488A',
          'primary-dark': '#0B1732',
          // Parchment family — logo's ivory shield background
          cream: '#E6D6AC',
          'cream-dark': '#CCBA92',
          // Gold family — logo's antique amber filigree
          gold: '#C48918',
          'gold-light': '#D4A830',
          'gold-hover': '#A57014',
          neutral: {
            50: '#F0E6D2',
            100: '#E4D8C0',
          },
        },
      },
      fontFamily: {
        hebrew: ['"Frank Ruhl Libre"', 'serif'],
        sans: ['Inter', 'sans-serif'],
        'serif-en': ['"EB Garamond"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
