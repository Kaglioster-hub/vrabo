// app/layout.js
import "../styles/globals.css";
import Script from "next/script";
import ThemeProviders from "./ThemeProvider";
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

async function pickLang() {
  const h = await headers();
  const al = (h.get("accept-language") || "").toLowerCase();
  return al.startsWith("it") ? "it" : "en";
}

export async function generateMetadata() {
  const lng = await pickLang();
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

export default async function RootLayout({ children }) {
  const lng = await pickLang();

  return (
    <html lang={lng} dir="ltr" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-gradient-to-b from-vrabo-blue to-vrabo-purple dark:from-gray-900 dark:to-black text-gray-900 dark:text-gray-100 font-sans antialiased">
        <ThemeProviders>
          <main className="flex-1 flex flex-col items-center justify-center">
            {children}
          </main>
          <ThemeToggle />
        </ThemeProviders>

        {/* JSON-LD Schema.org */}
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

        {/* PWA Service Worker */}
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
