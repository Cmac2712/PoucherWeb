/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        '0': '0'
      }
    },
  },
  plugins: [
    require("@tailwindcss/typography"), 
    require("daisyui")
  ],
}
