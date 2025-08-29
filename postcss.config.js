// postcss.config.js
module.exports = {
  plugins: {
    // 🔹 Core
    tailwindcss: {},

    // 🔹 Autoprefixer avanzato
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

    // 🔹 Nesting moderno (stile SCSS)
    "postcss-nesting": {},

    // 🔹 Feature CSS future
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

    // 🔹 Tipografia fluida
    "postcss-fluid": {
      fontSize: true,
      spacing: true,
      lineHeight: true,
    },

    // 🔹 Dark/Light mode
    "postcss-dark-theme-class": {
      darkSelector: ".dark",
      lightSelector: ".light",
    },

    // 🔹 Custom properties senza importFrom
    "postcss-custom-properties": { preserve: true },

    // 🔹 Utility extra
    "postcss-inline-svg": { removeFill: true },
    "postcss-image-set-function": {},
    "postcss-rtlcss": {},

    // 🔹 FIX e compatibilità cross-browser
    "postcss-flexbugs-fixes": {},  // 🔥 corregge bug Flexbox
    "postcss-normalize": {},       // 🔥 reset CSS moderno

    // 🔹 Ottimizzazione in produzione
    ...(process.env.NODE_ENV === "production"
      ? {
          cssnano: {
            preset: [
              "default",
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
