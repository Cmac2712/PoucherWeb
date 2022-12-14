/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        none: '0px',
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      fontSize: {
        '0': '0'
      }
    },
  },
  daisyui: {
    themes: ['coffee', 'dracula', 'lofi', 'light', 'dark', 'wireframe', 'night']
  },
  plugins: [
    require("@tailwindcss/typography"), 
    require("daisyui")
  ],
}
