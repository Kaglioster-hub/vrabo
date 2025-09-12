// app/layout.js
import "../styles/globals.css";
import Script from "next/script";
import ThemeProviders from "./ThemeProvider"; // <- corrisponde al tuo file app/ThemeProvider.jsx
import ThemeToggle from "@/components/ThemeToggle";
import { headers } from "next/headers";

/* SEO multilingua */
const SEO_TEXTS = {
  it: {
    title: "VRABO – Il comparatore dei comparatori",
    description:
      "VRABO confronta hotel, voli, auto, trading, finanza e molto altro. Non sceglie per te, sceglie con te.",
    locale: "it_IT",
  },
  en: {
    title: "VRABO – The comparator of comparators",
    description:
      "VRABO compares hotels, flights, cars, trading, finance and more. It doesn’t choose for you, it chooses with you.",
    locale: "en_US",
  },
};

function pickLang() {
  const h = headers();
  const al = (h.get("accept-language") || "").toLowerCase();
  return al.startsWith("it") ? "it" : "en";
}

export async function generateMetadata() {
  const lng = pickLang();
  const { title, description, locale } = SEO_TEXTS[lng];
  return {
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
      locale,
      url: "https://vrabo.it",
      siteName: "VRABO",
      title,
      description,
      images: [
        { url: "https://vrabo.it/og-image.png", width: 1200, height: 630, alt: "VRABO comparatore" },
        { url: "https://vrabo.it/og-alt.png", width: 800, height: 600, alt: "VRABO alternative preview" },
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
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png" }],
    },
    manifest: "/manifest.webmanifest",
  };
}

export const viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }) {
  const lng = pickLang();
  return (
    <html lang={lng} dir="ltr" suppressHydrationWarning>
      <body className="bg-gray-100 dark:bg-black text-gray-900 dark:text-gray-100 font-sans antialiased">
        <ThemeProviders>
          {children}
          <ThemeToggle />
        </ThemeProviders>

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

        <Script id="pwa-sw" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker
                .register('/sw.js')
                .then(() => console.log("✅ Service Worker attivo"))
                .catch(err => console.log("❌ SW fail", err));
            });
          }
        `}</Script>
      </body>
    </html>
  );
}

