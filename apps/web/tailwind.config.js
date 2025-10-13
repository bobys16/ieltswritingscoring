/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: { 
      center: true, 
      padding: "1rem", 
      screens: { "2xl": "1200px" } 
    },
    extend: {
      colors: {
        brand: { 
          DEFAULT: "#3a7afe", 
          50: "#eef4ff", 
          600: "#2b63d9" 
        },
      }
    }
  },
  plugins: [],
}
