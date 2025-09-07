// postcss.config.js
module.exports = {
  plugins: {
    /* --- Core --- */
    tailwindcss: {},
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

    /* --- Modern CSS --- */
    "postcss-nesting": {}, // nesting moderno (SCSS-like)
    "postcss-preset-env": {
      stage: 0,
      features: {
        "nesting-rules": false, // ⚠️ disattivato qui per non confliggere con postcss-nesting
        "custom-properties": true,
        "logical-properties-and-values": true,
        "media-query-ranges": true,
        "color-functional-notation": true,
        "lab-function": true,
      },
    },

    /* --- Extra power --- */
    "postcss-fluid": {
      fontSize: true,
      spacing: true,
      lineHeight: true,
    },
    "postcss-dark-theme-class": {
      darkSelector: ".dark",
      lightSelector: ".light",
    },
    "postcss-custom-properties": { preserve: true },
    "postcss-inline-svg": { removeFill: true },
    "postcss-image-set-function": {},
    "postcss-rtlcss": {},

    /* --- Fix cross-browser --- */
    "postcss-flexbugs-fixes": {},
    "postcss-normalize": {},

    /* --- Ottimizzazione in produzione --- */
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
                zindex: false, // evita di rompere layering tailwind
              },
            ],
          },
          "postcss-discard-duplicates": {},
          "postcss-merge-rules": {},
        }
      : {}),
  },
};
