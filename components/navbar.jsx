"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

const NAV_ITEMS = [
  { href: "#about", label: "About" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contatti" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // chiude il menu su resize > md
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // chiude il menu quando si naviga a un anchor
  const handleItemClick = () => setOpen(false);

  return (
    <header className="sticky top-0 z-60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-800/60">
      <a
        href="#content"
        className="sr-only-focusable m-2 px-3 py-2 rounded-md bg-blue-600 text-white"
      >
        Salta al contenuto
      </a>

      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="h-6 w-6 rounded-[8px] bg-emerald-500 inline-block shadow-[0_0_12px_rgba(16,185,129,.6)]" />
          <span>VRABO</span>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-vrabo-blue">
              {item.label}
            </a>
          ))}
          <a
            href="#newsletter"
            className="btn btn-outline glass dark:glass-dark"
          >
            Newsletter
          </a>
          <ThemeToggle />
        </nav>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            aria-label="Apri menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="btn btn-outline"
          >
            {/* icona hamburger */}
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              {open ? (
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="1.5" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Drawer mobile */}
      {open && (
        <div className="md:hidden border-t border-gray-200/60 dark:border-gray-800/60">
          <nav className="px-6 py-4 flex flex-col gap-3">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={handleItemClick}
                className="py-2"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#newsletter"
              onClick={handleItemClick}
              className="btn btn-outline w-full"
            >
              Newsletter
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
