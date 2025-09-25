import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SITE_NAME || "VRABO",
  description: "VRABO – the comparator of comparators. Flights, hotels, cars. Faster, smarter, global.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="min-h-screen antialiased">
        <div className="container-max py-6">
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="VRABO" className="h-10 w-10" />
              <span className="text-lg font-semibold tracking-wide">VRABO</span>
            </div>
            <nav className="text-sm text-white/70">
              <a href="/legal" className="hover:text-white">Legal</a>
            </nav>
          </header>
          {children}
          <footer className="mt-12 text-center text-xs text-white/50">
            © {new Date().getFullYear()} VRABO — Comparator of Comparators. 
            <br/>
            <span className="opacity-80">
            Affiliate links may reward us. Prices & availability are provided by partners. Always verify details on their sites.
            </span>
          </footer>
        </div>
      </body>
    </html>
  );
}
