import "./globals.css";
import Header from "@/components/Header";
import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import Brand from "@/components/Brand";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VRABO",
  description: "Il comparatore dei comparatori. Non sceglie per te, sceglie con te."
};

export default function RootLayout({ children }:{ children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <Header />

        <main className="section">{children}</main>

        <footer className="container-hero py-10 text-sm text-white/60">
          © {new Date().getFullYear()} VRABO — tutti i diritti riservati
        </footer>
      </body>
    </html>
  );
}



