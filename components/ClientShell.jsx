// components/ClientShell.jsx
"use client";
import { useEffect, useState } from "react";

export default function ClientShell({ children }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("vrabo_theme");
    const t = saved || "light";
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
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center shadow-sm">
        <a href="/" className="font-extrabold text-2xl text-blue-600">VRABO</a>
        <div className="flex gap-6 items-center">
          <a href="#about" className="hover:text-blue-500">About</a>
          <a href="#donazioni" className="hover:text-blue-500">Donazioni</a>
          <a href="#contact" className="hover:text-blue-500">Contatti</a>
          <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:scale-105 transition">
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </nav>

      <main>{children}</main>

      <footer className="bg-gray-900 text-gray-400 text-center py-8 text-sm mt-10">
        <p>© {new Date().getFullYear()} <span className="text-white font-semibold">VRABO</span> – Tutti i diritti riservati.</p>
        <div className="mt-3 flex justify-center gap-6">
          <a href="https://twitter.com/vrabo" target="_blank" className="hover:text-white">Twitter</a>
          <a href="https://t.me/vrabo" target="_blank" className="hover:text-white">Telegram</a>
          <a href="https://github.com/vrabo" target="_blank" className="hover:text-white">GitHub</a>
        </div>
      </footer>
    </>
  );
}
