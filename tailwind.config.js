/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: 'rgb(var(--brand-red) / <alpha-value>)',
          dark: 'rgb(var(--brand-red) / <alpha-value>)',
          light: '#f8fafc'
        }
      },
      fontFamily: {
        sans: ['Noto Sans TC', 'sans-serif'],
        serif: ['Noto Serif TC', 'serif'],
      }
    }
  },
  plugins: [],
}
