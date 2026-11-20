/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#17243A",
          50: "#F0F4F8",
          100: "#D9E2EC",
          200: "#BCCCDC",
          300: "#9FB3C8",
          400: "#829AB1",
          500: "#627D98",
          600: "#486581",
          700: "#334E68",
          800: "#243B53",
          900: "#17243A",
          950: "#0D1522",
        },
        cream: {
          DEFAULT: "#F8F5EF",
          50: "#FCFBF8",
          100: "#F8F5EF",
          200: "#EFE9DC",
          300: "#E5DCC8",
          400: "#DACFB4",
        },
        gold: {
          DEFAULT: "#C6A66B",
          light: "#DFC692",
          dark: "#A58547",
        },
        dusty: {
          blue: "#A9BDD2",
        },
        sage: {
          DEFAULT: "#A9B7A3",
        },
        charcoal: {
          DEFAULT: "#333842",
          light: "#4E5463",
          dark: "#22252C",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Playfair Display", "Cormorant Garamond", "serif"],
        sans: ["var(--font-inter)", "Inter", "Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
