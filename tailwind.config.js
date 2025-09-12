/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
  darkMode: "class",

  content: [
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",
    "./pages/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/**/*.{js,jsx,ts,tsx,mdx}",
  ],

  // App Router: niente #__next -> usa html (o rimuovi del tutto)
  important: "html",

  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.5rem", sm: "2rem", lg: "2rem", xl: "2.5rem", "2xl": "3rem" },
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        vrabo: {
          blue: "#2563eb",
          purple: "#7c3aed",
          pink: "#ec4899",
          gold: "#fbbf24",
          dark: "#0f172a",
        },
        cosmic: { start: "#1e3a8a", mid: "#6d28d9", end: "#ec4899" },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        display: ["Poppins", "ui-sans-serif"],
        mono: ["Fira Code", "monospace"],
      },
      screens: { xs: "420px", "3xl": "1920px", "4k": "2560px" },
      boxShadow: {
        glow: "0 0 20px rgba(124, 58, 237, 0.6)",
        neon: "0 0 10px #7c3aed, 0 0 20px #7c3aed, 0 0 40px #ec4899",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
        pulseGlow: {
          "0%,100%": { opacity: 1, filter: "drop-shadow(0 0 10px #7c3aed)" },
          "50%": { opacity: 0.6, filter: "drop-shadow(0 0 20px #ec4899)" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
      },
      backdropBlur: { xs: "2px", xl: "20px" },
      spacing: { 128: "32rem", 144: "36rem" },
      zIndex: { 60: "60", 70: "70", 80: "80" },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            maxWidth: "75ch",
            a: { color: theme("colors.vrabo.blue"), textDecoration: "none" },
            "a:hover": { textDecoration: "underline" },
            code: { backgroundColor: theme("colors.gray.100"), padding: "0.15rem 0.35rem", borderRadius: "0.375rem" },
            pre: { backgroundColor: theme("colors.gray.900"), color: "white", borderRadius: "0.75rem" },
          },
        },
        invert: {
          css: {
            a: { color: theme("colors.blue.400") },
            code: { backgroundColor: theme("colors.gray.800") },
            pre: { backgroundColor: theme("colors.gray.800") },
          },
        },
      }),
    },
  },

  // classi usate dinamicamente in JS
  safelist: [
    { pattern: /(from|via|to)-(vrabo|cosmic)-(blue|purple|pink|gold|start|mid|end)/ },
    { pattern: /(bg|text)-(vrabo|cosmic)-(blue|purple|pink|gold|start|mid|end)/ },
    { pattern: /grid-cols-(1|2|3|4)/ },
    { pattern: /col-span-(1|2|3|4)/ },
    { pattern: /(aria|data)-.*/ },
  ],

  plugins: [
    require("@tailwindcss/forms")({ strategy: "class" }),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),

    plugin(({ addVariant }) => {
      // utility
      addVariant("child", "& > *");
      addVariant("child-hover", "& > *:hover");
      // aria/data
      addVariant("aria-selected", '&[aria-selected="true"]');
      addVariant("aria-current", '&[aria-current="page"]');
      ["open", "closed", "active", "checked", "selected"].forEach((state) => {
        addVariant(`data-${state}`, `&[data-state="${state}"]`);
      });
      // @supports variant (per backdrop-filter, ecc.)
      addVariant("supports-backdrop", "@supports (backdrop-filter: blur(0))");
    }),
  ],
};

// Safelist estesa
module.exports.safelist.push({ pattern: /(bg|text|from|via|to)-(red|green|blue|yellow|pink|purple|gray)-(100|200|300|400|500|600|700|800|900)/ });
