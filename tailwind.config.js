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

  important: "html",

  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",
        sm: "2rem",
        lg: "2rem",
        xl: "2.5rem",
        "2xl": "3rem",
      },
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
      zIndex: { 50: "50", 60: "60", 70: "70", 80: "80" },
      spacing: { 128: "32rem", 144: "36rem" },
      backdropBlur: { xs: "2px", xl: "20px" },

      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulseGlow: {
          "0%,100%": {
            opacity: 1,
            filter: "drop-shadow(0 0 10px #7c3aed)",
          },
          "50%": {
            opacity: 0.6,
            filter: "drop-shadow(0 0 20px #ec4899)",
          },
        },
        popIn: {
          "0%": { transform: "scale(.96)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        wiggle: {
          "0%,100%": { transform: "rotate(0)" },
          "50%": { transform: "rotate(-3deg)" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
        popIn: "popIn .2s ease-out",
        wiggle: "wiggle .25s ease-in-out",
      },

      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            maxWidth: "75ch",
            a: { color: theme("colors.vrabo.blue"), textDecoration: "none" },
            "a:hover": { textDecoration: "underline" },
            code: {
              backgroundColor: theme("colors.gray.100"),
              padding: "0.15rem 0.35rem",
              borderRadius: "0.375rem",
            },
            pre: {
              backgroundColor: theme("colors.gray.900"),
              color: "white",
              borderRadius: "0.75rem",
            },
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

  safelist: [
    { pattern: /(from|via|to)-(vrabo|cosmic)-(blue|purple|pink|gold|start|mid|end)/ },
    { pattern: /(bg|text)-(vrabo|cosmic)-(blue|purple|pink|gold|start|mid|end)/ },
    { pattern: /grid-cols-(1|2|3|4)/ },
    { pattern: /col-span-(1|2|3|4)/ },
    { pattern: /(aria|data)-.*/ },
    {
      pattern:
        /(bg|text|from|via|to)-(red|green|blue|yellow|pink|purple|gray)-(100|200|300|400|500|600|700|800|900)/,
    },
  ],

  plugins: [
    require("@tailwindcss/forms")({ strategy: "class" }),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),

    plugin(({ addComponents }) => {
      // 🔘 Badge
      addComponents({
        ".badge": {
          "@apply inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200":
            {},
        },
        ".badge-success": {
          "@apply bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300":
            {},
        },
        ".badge-danger": {
          "@apply bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300":
            {},
        },
        ".badge-info": {
          "@apply bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300":
            {},
        },
      });

      // 🔘 Button
      addComponents({
        ".btn": {
          "@apply inline-flex items-center justify-center rounded-xl px-4 py-2 font-semibold transition":
            {},
        },
        ".btn-outline": {
          "@apply btn border border-gray-300 bg-transparent text-gray-800 dark:text-gray-200":
            {},
        },
        ".btn-success": { "@apply btn bg-emerald-600 text-white": {} },
        ".btn-danger": { "@apply btn bg-rose-600 text-white": {} },
        ".btn-gradient": {
          "@apply btn text-white shadow-xl": {},
          background: "var(--grad-primary)",
        },
      });

      // 🔘 Toast
      addComponents({
        ".toast": {
          "@apply fixed z-80 bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-3":
            {},
        },
        ".toast-success": { "@apply bg-emerald-600": {} },
        ".toast-error": { "@apply bg-rose-600": {} },
      });
    }),

    plugin(({ addVariant }) => {
      addVariant("child", "& > *");
      addVariant("child-hover", "& > *:hover");
      addVariant("aria-selected", '&[aria-selected="true"]');
      addVariant("aria-current", '&[aria-current="page"]');
      ["open", "closed", "active", "checked", "selected"].forEach((state) => {
        addVariant(`data-${state}`, `&[data-state="${state}"]`);
      });
      addVariant("supports-backdrop", "@supports (backdrop-filter: blur(0))");
    }),
  ],
};
