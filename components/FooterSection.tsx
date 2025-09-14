"use client";

import React from "react";

export default function FooterSection() {
  return (
    <footer className="py-10 px-6 mt-auto bg-white/70 dark:bg-gray-900/40 backdrop-blur">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-600 dark:text-gray-300">
        <div>© {new Date().getFullYear()} VRABO • Tutti i diritti riservati</div>
        <div className="flex gap-4">
          <a href="/privacy" className="hover:underline">Privacy</a>
          <a href="/terms" className="hover:underline">Termini</a>
          <a href="/contact" className="hover:underline">Contatti</a>
        </div>
      </div>
    </footer>
  );
}
