import "../styles/globals.css";

// ====================== METADATA ======================
export const metadata = {
  title: "VRABO – Il comparatore dei comparatori",
  description:
    "VRABO confronta hotel, voli, auto, trading, finanza e molto altro. Non sceglie per te, sceglie con te.",
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
    locale: "it_IT",
    url: "https://vrabo.it",
    siteName: "VRABO",
    title: "VRABO – Il comparatore dei comparatori",
    description:
      "VRABO è il comparatore dei comparatori. Trova hotel, voli, auto, trading e carte in un click.",
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
    title: "VRABO – Il comparatore dei comparatori",
    description:
      "Trova hotel, voli, auto, carte e broker con commissioni minime. Non sceglie per te, sceglie con te.",
    images: ["https://vrabo.it/og-image.png"],
  },
};

// ✅ Next 14: viewport export separato (fix al warning build)
export const viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" dir="ltr">
      <head>
        {/* SEO & PWA Essentials */}
        <meta charSet="UTF-8" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="author" content="VRABO Team" />
        <meta name="publisher" content="VRABO" />
        <meta name="application-name" content="VRABO" />
        <meta name="apple-mobile-web-app-title" content="VRABO" />

        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="mask-icon" href="/icon.svg" color="#0f172a" />

        {/* Preconnect & Prefetch */}
        <link rel="preconnect" href="https://api.travelpayouts.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.travelpayouts.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />

        {/* Schema.org (Website + Organization + Breadcrumb) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
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
              breadcrumb: {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: "https://vrabo.it",
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Comparatore",
                    item: "https://vrabo.it/#search",
                  },
                ],
              },
            }),
          }}
        />

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker
                    .register('/sw.js')
                    .then(() => console.log("✅ Service Worker attivo"))
                    .catch(err => console.log("❌ SW fail", err));
                });
              }
            `,
          }}
        />
      </head>
      <body className="bg-gray-100 dark:bg-black text-gray-900 dark:text-gray-100 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
