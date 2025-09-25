import "./globals.css";
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
        <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur">
          <div className="container-hero py-3 flex items-center justify-between">
  <a href="/" className="flex items-center gap-2">
    <img src="/logo.png" alt="VRABO" width="24" height="24" className="rounded-sm"/>
    <span className="font-bold tracking-wide text-lg">VRABO</span>
  </a>
  <nav className="flex items-center gap-2">
              <Link href="/discover" className="btn btn-ghost btn-sm">Discover</Link>
              <Link href="/donate" className="btn btn-primary btn-sm">Dona</Link>
            </nav>
          </div>
        </header>

        <main className="section">{children}</main>

        <footer className="container-hero py-10 text-sm text-white/60">
          © {new Date().getFullYear()} VRABO — tutti i diritti riservati
        </footer>
      </body>
    </html>
  );
}


