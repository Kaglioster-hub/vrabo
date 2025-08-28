module.exports = {
  plugins: {
    // 🌌 Core VRABO: Tailwind
    tailwindcss: {},

    // 🔧 Autoprefixer con setup avanzato
    autoprefixer: {
      grid: "autoplace",
      flexbox: "no-2009",
      overrideBrowserslist: [
        ">0.2%",
        "not dead",
        "not op_mini all",
        "ie >= 11",
      ],
    },

    // 🌀 Nesting SCSS-like
    "postcss-nesting": {},

    // 🔮 Futuro CSS (custom props, media query ranges, color()…)
    "postcss-preset-env": {
      stage: 0,
      features: {
        "nesting-rules": true,
        "custom-properties": true,
        "logical-properties-and-values": true,
        "media-query-ranges": true,
        "color-functional-notation": true,
        "lab-function": true,
      },
    },

    // 📏 Tipografia fluida + spacing responsive
    "postcss-fluid": {
      fontSize: true,
      spacing: true,
      lineHeight: true,
    },

    // 🌗 Dark/Light mode tematiche
    "postcss-dark-theme-class": {
      darkSelector: ".dark",
      lightSelector: ".light",
    },

    // 🎨 Variabili automatiche (CSS custom properties)
    "postcss-custom-properties": {
      preserve: true,
      importFrom: "./styles/variables.css",
    },

    // 🖼️ Ottimizzazione immagini inline (SVG, webp, avif)
    "postcss-inline-svg": { removeFill: true },
    "postcss-image-set-function": {},

    // 🌍 RTL support (Right-to-Left)
    "postcss-rtlcss": {},

    // 🚀 Performance e pulizia
    ...(process.env.NODE_ENV === "production"
      ? {
          cssnano: {
            preset: [
              "advanced",
              {
                discardComments: { removeAll: true },
                normalizeWhitespace: true,
                mergeLonghand: true,
                colormin: true,
                reduceIdents: true,
                zindex: false,
              },
            ],
          },
          "postcss-discard-duplicates": {},
          "postcss-merge-rules": {},
        }
      : {}),
  },
};
