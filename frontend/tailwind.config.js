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
        primary: {
          DEFAULT: "#1e3a2f", // Deep forest green
          dark: "#142720",
          light: "#2b5142",
        },
        accent: {
          DEFAULT: "#2d7a78", // Muted teal
          light: "#3d9b99",
        },
        surface: {
          bg: "#faf8f5", // Warm off-white
          card: "#ffffff",
          muted: "#f0ece4",
        },
        status: {
          verified: "#15803d",
          unverified: "#b45309", // Amber
          error: "#b91c1c",
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        nastaliq: ["Noto Nastaliq Urdu", "serif"],
      }
    },
  },
  plugins: [],
};
