import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PWARegister from "@/components/PWARegister";
import Consent from "@/components/Consent";
import type { ReactNode } from "react";

export const metadata = {
  title: "VRABO — Comparatore dei comparatori",
  description: "Non sceglie per te: sceglie con te.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://vrabo.it")
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <PWARegister />
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
        <Consent />
      </body>
    </html>
  );
}
