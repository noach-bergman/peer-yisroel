/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#2c5f7a',
          'primary-light': '#3d7a9a',
          'primary-dark': '#1e4257',
          cream: '#e8d8b5',
          'cream-dark': '#d4c49a',
          gold: '#b8943f',
          'gold-hover': '#a07c2d',
          neutral: {
            50: '#f8f5ee',
            100: '#f0ead7',
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
