// components/ClientShell.jsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ClientShell({ children }) {
  const [theme, setTheme] = useState("light");
  const [menuOpen, setMenuOpen] = useState(false);

  // Setup theme iniziale: localStorage > preferenze OS
  useEffect(() => {
    const saved = localStorage.getItem("vrabo_theme");
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const t = saved || (prefersDark ? "dark" : "light");
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("vrabo_theme", next);
  };

  return (
    <>
      {/* NAVBAR */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center shadow-sm"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-extrabold text-2xl text-blue-600">
          <img src="/icon-192.png" alt="VRABO logo" className="w-8 h-8 rounded-lg" />
          <span className="hidden sm:inline">VRABO</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 items-center">
          <Link href="#about" className="hover:text-blue-500">About</Link>
          <Link href="#donazioni" className="hover:text-blue-500">Donazioni</Link>
          <Link href="#contact" className="hover:text-blue-500">Contatti</Link>
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:scale-105 transition"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-md bg-gray-200 dark:bg-gray-700"
          aria-label="Menu"
        >
          ☰
        </button>
      </motion.nav>

      {/* Mobile Menu Drawer */}
      {menuOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          className="fixed top-0 right-0 w-64 h-full bg-white dark:bg-gray-900 shadow-lg z-40 p-6 flex flex-col gap-6"
        >
          <button onClick={() => setMenuOpen(false)} className="self-end text-2xl">
            ✕
          </button>
          <Link href="#about" onClick={() => setMenuOpen(false)}>About</Link>
          <Link href="#donazioni" onClick={() => setMenuOpen(false)}>Donazioni</Link>
          <Link href="#contact" onClick={() => setMenuOpen(false)}>Contatti</Link>
          <button
            onClick={() => { toggleTheme(); setMenuOpen(false); }}
            className="mt-4 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700"
          >
            {theme === "light" ? "🌙 Attiva dark" : "☀️ Attiva light"}
          </button>
        </motion.div>
      )}

      {/* MAIN */}
      <main>{children}</main>

      {/* FOOTER */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="bg-gray-900 text-gray-400 text-center py-8 text-sm mt-10"
      >
        <p>
          © {new Date().getFullYear()}{" "}
          <span className="text-white font-semibold">VRABO</span> – Tutti i diritti riservati.
        </p>
        <div className="mt-3 flex justify-center gap-6">
          <a href="https://twitter.com/vrabo" target="_blank" rel="noopener" className="hover:text-white">
            Twitter
          </a>
          <a href="https://t.me/vrabo" target="_blank" rel="noopener" className="hover:text-white">
            Telegram
          </a>
          <a href="https://github.com/vrabo" target="_blank" rel="noopener" className="hover:text-white">
            GitHub
          </a>
        </div>
      </motion.footer>
    </>
  );
}
