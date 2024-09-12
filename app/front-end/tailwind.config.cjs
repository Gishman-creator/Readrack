/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        arsenal: ['Arsenal', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        arima: ['Arima', 'system-ui'],
      },
      colors: {
        primary: '#15803d', // Set your preferred shade of blue here
      },
      boxShadow: {
        'custom3': '0px 0px 15px rgba(0, 0, 0, 0.2)',
        'custom4': '0px 0px 15px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
};
