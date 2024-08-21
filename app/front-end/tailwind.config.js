/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        arsenal: ['Arsenal', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        arima: ['Arima', 'system-ui']
      },
    },
  },
  plugins: [],
}

