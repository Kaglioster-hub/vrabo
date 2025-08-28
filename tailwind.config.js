/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // 🌗 supporto dark mode basato su classe
  content: [
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",
    "./pages/**/*.{js,jsx,ts,tsx,mdx}",
    "./styles/**/*.css",
  ],
  theme: {
    extend: {
      // 🎨 Palette VRABO
      colors: {
        vrabo: {
          blue: "#2563eb",
          purple: "#7c3aed",
          pink: "#ec4899",
          gold: "#fbbf24",
          dark: "#0f172a",
        },
        cosmic: {
          start: "#1e3a8a",
          mid: "#6d28d9",
          end: "#ec4899",
        },
      },

      // 🔠 Font
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        display: ["Poppins", "ui-sans-serif"],
        mono: ["Fira Code", "monospace"],
      },

      // 📱 Breakpoints extra
      screens: {
        xs: "420px",
        "3xl": "1920px",
        "4k": "2560px",
      },

      // 🌌 Ombre & glow
      boxShadow: {
        glow: "0 0 20px rgba(124, 58, 237, 0.6)",
        neon: "0 0 10px #7c3aed, 0 0 20px #7c3aed, 0 0 40px #ec4899",
      },

      // 🌀 Animazioni
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: 1, filter: "drop-shadow(0 0 10px #7c3aed)" },
          "50%": { opacity: 0.6, filter: "drop-shadow(0 0 20px #ec4899)" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
      },

      // 🪞 Glassmorphism
      backdropBlur: {
        xs: "2px",
        xl: "20px",
      },

      // 📏 Spacing
      spacing: {
        128: "32rem",
        144: "36rem",
      },
    },
  },
  // 🔌 Plugin extra (NO line-clamp, già built-in)
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
