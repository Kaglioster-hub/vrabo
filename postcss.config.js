// postcss.config.js
module.exports = {
  plugins: {
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

    "postcss-nesting": {},

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

    "postcss-fluid": {
      fontSize: true,
      spacing: true,
      lineHeight: true,
    },

    "postcss-dark-theme-class": {
      darkSelector: ".dark",
      lightSelector: ".light",
    },

    "postcss-custom-properties": {
      preserve: true, // ✅ niente più importFrom
    },

    "postcss-inline-svg": { removeFill: true },
    "postcss-image-set-function": {},
    "postcss-rtlcss": {},

    ...(process.env.NODE_ENV === "production"
      ? {
          cssnano: {
            preset: [
              "default", // ✅ advanced rimosso
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
