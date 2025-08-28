/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest.json$/],
});

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = withBundleAnalyzer(
  withPWA({
    reactStrictMode: true,
    swcMinify: true,
    compress: true,
    poweredByHeader: false,
    trailingSlash: false,
    generateEtags: true,

    // 🚀 Sperimentali puliti
    experimental: {
      optimizePackageImports: ["recharts", "framer-motion"],
    },

    // 🌍 Multilingua
    i18n: {
      locales: ["it", "en", "fr", "es", "pt", "ja", "zh"],
      defaultLocale: "it",
    },

    // 📸 Immagini
    images: {
      domains: [
        "images.unsplash.com",
        "cdn.pixabay.com",
        "img.freepik.com",
        "media.istockphoto.com",
        "cdn.vrabo.it",
      ],
      formats: ["image/avif", "image/webp"],
      minimumCacheTTL: 60,
      dangerouslyAllowSVG: true,
    },

    // 🛡 Headers
    async headers() {
      return [
        {
          source: "/(.*)",
          headers: [
            { key: "X-Frame-Options", value: "SAMEORIGIN" },
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            {
              key: "Content-Security-Policy",
              value: `
                default-src 'self';
                script-src 'self' 'unsafe-inline' 'unsafe-eval' https:;
                style-src 'self' 'unsafe-inline' https:;
                img-src 'self' blob: data: https:;
                font-src 'self' https: data:;
                connect-src 'self' https: wss:;
                media-src 'self' blob: data: https:;
                frame-src 'self' https:;
                worker-src 'self' blob:;
                object-src 'none';
                base-uri 'self';
              `.replace(/\s{2,}/g, " "),
            },
            {
              key: "Permissions-Policy",
              value: "geolocation=(self), microphone=(), camera=(), payment=(self)",
            },
          ],
        },
      ];
    },

    // 🔁 Redirects
    async redirects() {
      return [
        { source: "/privacy", destination: "/legal/privacy.html", permanent: true },
        { source: "/cookies", destination: "/legal/cookies.html", permanent: true },
        { source: "/about", destination: "/#about", permanent: true },
        { source: "/donate", destination: "/#donazioni", permanent: true },
        { source: "/support", destination: "/#donazioni", permanent: true },
      ];
    },

    // 🔄 Rewrites
    async rewrites() {
      return [
        {
          source: "/api/proxy/:path*",
          destination: "https://api.external-service.com/:path*",
        },
        {
          source: "/cdn/fonts/:path*",
          destination: "https://fonts.gstatic.com/:path*",
        },
      ];
    },

    // 🔑 Variabili
    env: {
      VRABO_DEBUG: process.env.VRABO_DEBUG || "false",
      VRABO_PWA: "true",
      VRABO_ANALYTICS: "plausible",
    },
  })
);

module.exports = nextConfig;
