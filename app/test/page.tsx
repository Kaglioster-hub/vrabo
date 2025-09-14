"use client";

import React from "react";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white p-10 space-y-10">
      <h1 className="text-3xl font-bold mb-6">⚡ VRABO – UI Test Page</h1>

      {/* Buttons */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Buttons</h2>
        <div className="flex gap-4 flex-wrap">
          <button className="btn btn-outline">Outline</button>
          <button className="btn btn-success">Success</button>
          <button className="btn btn-danger">Danger</button>
          <button className="btn btn-gradient">Gradient</button>
        </div>
      </section>

      {/* Badges */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Badges</h2>
        <div className="flex gap-3">
          <span className="badge">Default</span>
          <span className="badge badge-success">Success</span>
          <span className="badge badge-danger">Danger</span>
          <span className="badge badge-info">Info</span>
        </div>
      </section>

      {/* Toast */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Toast</h2>
        <div className="toast">Default Toast</div>
        <div className="toast toast-success mt-3">Success Toast</div>
        <div className="toast toast-error mt-3">Error Toast</div>
      </section>

      {/* Table */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Table</h2>
        <table className="table-vrabo">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Ruolo</th>
              <th>Stato</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Davide</td>
              <td>Founder</td>
              <td><span className="badge badge-success">Active</span></td>
            </tr>
            <tr>
              <td>Kenny</td>
              <td>Music</td>
              <td><span className="badge badge-info">Pending</span></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Hero Glow */}
      <section className="relative h-64 bg-gray-900 rounded-2xl overflow-hidden">
        <h2 className="absolute top-4 left-4 text-white font-semibold">
          Hero Glow Test
        </h2>
        <div className="hero-glow" />
      </section>

      {/* Prose */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Prose Content</h2>
        <article className="prose-vrabo">
          <h1>Titolo grande</h1>
          <p>
            Questo è un paragrafo con <code>code</code> e un{" "}
            <a href="#">link</a>.
          </p>
          <h2>Sottotitolo</h2>
          <ul>
            <li>Elemento uno</li>
            <li>Elemento due</li>
          </ul>
        </article>
      </section>

      {/* Focus ring */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Focus Ring</h2>
        <input
          type="text"
          placeholder="Focus me"
          className="px-3 py-2 rounded-lg border focus-ring"
        />
      </section>
    </div>
  );
}
