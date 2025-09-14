"use client";

import React from "react";

export default function TestimonialsSection() {
  const items = [
    { name: "Giulia", text: "Ho trovato voli più economici in 2 minuti." },
    { name: "Luca", text: "Semplice e veloce, ottimo per confrontare hotel." },
    { name: "Sara", text: "Mi piace che non ci siano registrazioni obbligatorie." },
  ];

  return (
    <section className="py-12 px-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Dicono di noi</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((it, i) => (
          <blockquote key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow">
            <p className="text-gray-800 dark:text-gray-200">“{it.text}”</p>
            <footer className="mt-3 text-sm text-gray-500">— {it.name}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
