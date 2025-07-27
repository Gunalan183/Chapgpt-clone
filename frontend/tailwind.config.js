/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chat-bg': '#343541',
        'chat-input': '#40414f',
        'chat-border': '#565869',
        'sidebar-bg': '#202123',
      },
      animation: {
        'typing': 'typing 1.5s steps(40, end) infinite',
      },
      keyframes: {
        typing: {
          '0%': { width: '0' },
          '50%': { width: '100%' },
          '100%': { width: '0' },
        }
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
