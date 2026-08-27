/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        aitu: {
          primary: '#0B5FFF',
          dark: '#111827',
          surface: '#F6F7F9',
          border: '#D8DCE3'
        }
      },
      fontFamily: {
        sans: ['Arial', 'Helvetica Neue', 'system-ui', 'sans-serif'],
        heading: ['Arial', 'Helvetica Neue', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.16s ease-out forwards',
        'slide-up': 'slideUp 0.18s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
