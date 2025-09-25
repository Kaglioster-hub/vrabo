import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "VRABO", template: "%s | VRABO" },
  description: "Il comparatore dei comparatori. Non sceglie per te, sceglie con te.",
  applicationName: "VRABO",
  themeColor: "#0b0c0e",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
  icons: { icon: "/favicon.png" },
  openGraph: {
    title: "VRABO",
    description: "Il comparatore dei comparatori. Non sceglie per te, sceglie con te.",
    siteName: "VRABO",
    type: "website",
    locale: "it_IT"
  }
};

export default function RootLayout({ children }:{ children: React.ReactNode }) {
  return (
    <html lang="it" className="scroll-smooth">
      <body className={inter.className}>
        <a href="#content" className="visually-hidden focus:not-sr-only">Salta al contenuto</a>
        <Header />
        <main id="content" className="section">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
