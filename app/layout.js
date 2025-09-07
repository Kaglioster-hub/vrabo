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

        {/* Service Worker */}
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
