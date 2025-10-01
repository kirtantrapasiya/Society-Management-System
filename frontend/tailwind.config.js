/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // ✅ include all React files
  ],
  theme: {
    extend: {
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        // Custom breakpoint for <900px
        'custom-sm': '900px', 
      },
    },
  },
  plugins: [],
};
