// app/layout.js
import "../styles/globals.css";
import Script from "next/script";
import i18next from "i18next";

// Preleva lingua corrente (fallback "it")
const lng = i18next.language || "it";

// Traduzioni SEO multilingua
const SEO_TEXTS = {
  it: {
    title: "VRABO – Il comparatore dei comparatori",
    description:
      "VRABO confronta hotel, voli, auto, trading, finanza e molto altro. Non sceglie per te, sceglie con te.",
  },
  en: {
    title: "VRABO – The comparator of comparators",
    description:
      "VRABO compares hotels, flights, cars, trading, finance and more. It doesn’t choose for you, it chooses with you.",
  },
};

const { title, description } = SEO_TEXTS[lng] || SEO_TEXTS.it;

// ====================== METADATA ======================
export const metadata = {
  title,
  description,
  metadataBase: new URL("https://vrabo.it"),
  keywords: [
    "comparatore viaggi",
    "voli economici",
    "hotel economici",
    "noleggio auto",
    "bnb",
    "finanza",
    "broker trading",
    "VRABO",
  ],
  openGraph: {
    type: "website",
    locale: lng === "it" ? "it_IT" : "en_US",
    url: "https://vrabo.it",
    siteName: "VRABO",
    title,
    description,
    images: [
      {
        url: "https://vrabo.it/og-image.png",
        width: 1200,
        height: 630,
        alt: "VRABO comparatore",
      },
      {
        url: "https://vrabo.it/og-alt.png",
        width: 800,
        height: 600,
        alt: "VRABO alternative preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@vrabo",
    creator: "@vrabo",
    title,
    description,
    images: ["https://vrabo.it/og-image.png"],
  },
};

// ✅ Next 14: viewport export separato
export const viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }) {
  return (
    <html lang={lng} dir="ltr">
      <head>
        {/* SEO & PWA Essentials */}
        <meta charSet="UTF-8" />
        <meta
          name="robots"
          content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        />
        <meta name="author" content="VRABO Team" />
        <meta name="publisher" content="VRABO" />
        <meta name="application-name" content="VRABO" />
        <meta name="apple-mobile-web-app-title" content="VRABO" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />

        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="mask-icon" href="/icon.svg" color="#0f172a" />

        {/* Preload font principale */}
        <link
          rel="preload"
          href="/fonts/Inter-Variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* Preconnect & Prefetch */}
        <link
          rel="preconnect"
          href="https://api.travelpayouts.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://api.travelpayouts.com" />
        <link
          rel="preconnect"
          href="https://images.unsplash.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="bg-gray-100 dark:bg-black text-gray-900 dark:text-gray-100 font-sans antialiased">
        {children}

        {/* Schema.org con next/script */}
        <Script id="schema-org" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "VRABO",
            url: "https://vrabo.it",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://vrabo.it/?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
            publisher: {
              "@type": "Organization",
              name: "VRABO",
              url: "https://vrabo.it",
              logo: "https://vrabo.it/logo.png",
            },
          })}
        </Script>

        {/* Service Worker con next/script */}
        <Script id="pwa-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker
                  .register('/sw.js')
                  .then(() => console.log("✅ Service Worker attivo"))
                  .catch(err => console.log("❌ SW fail", err));
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
