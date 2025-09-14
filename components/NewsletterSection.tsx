"use client";

import React from "react";

export default function NewsletterSection() {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") || "");
    if (email) alert(`Grazie! Ti avviseremo su ${email}.`);
    e.currentTarget.reset();
  };

  return (
    <section className="py-12 px-6 max-w-xl mx-auto text-center">
      <h2 className="text-2xl font-bold mb-2">Newsletter</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">Novità e offerte, senza spam.</p>
      <form onSubmit={onSubmit} className="flex gap-2 justify-center">
        <input
          type="email"
          name="email"
          required
          placeholder="la-tua@email.it"
          className="w-full max-w-sm px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
        />
        <button className="btn-gradient rounded-xl px-5" type="submit">Iscrivimi</button>
      </form>
    </section>
  );
}
