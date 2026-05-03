/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1C3A6E',
          'primary-light': '#2B5499',
          'primary-dark': '#0F2248',
          cream: '#E5D5A5',
          'cream-dark': '#CFBD90',
          gold: '#C49A30',
          'gold-hover': '#A87B20',
          neutral: {
            50: '#F2E8D8',
            100: '#EAE0CB',
          },
        },
      },
      fontFamily: {
        hebrew: ['"Frank Ruhl Libre"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
