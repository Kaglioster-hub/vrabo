"use client";

import React from "react";

export default function FAQSection() {
  const faqs = [
    { q: "Come guadagna VRABO?", a: "Con link affiliati senza costi aggiuntivi per te." },
    { q: "I risultati sono imparziali?", a: "Sì, priorità a rilevanza e prezzo, non a sponsorizzazioni." },
    { q: "Serve un account?", a: "No, puoi cercare liberamente e senza login." },
  ];

  return (
    <section className="py-12 px-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">FAQ</h2>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <details key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
            <summary className="cursor-pointer font-semibold">{f.q}</summary>
            <p className="mt-2 text-gray-700 dark:text-gray-300">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
