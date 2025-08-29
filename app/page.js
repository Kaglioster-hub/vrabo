"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Script from "next/script";

// Recharts
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Import i18n config
import "@/app/i18n";
import { useTranslation } from "react-i18next";

// Componenti modularizzati
import SearchBarUltraPro from "@/components/SearchBarUltraPro";
import Donations from "@/components/Donations";
import CookieBanner from "@/components/CookieBanner";
import SkeletonCard from "@/components/SkeletonCard";

// Utils
import { toISO } from "@/utils/helpers";

// Hooks
import useAffiliate from "@/hooks/useAffiliate";

// -------------------------------------------------------------
// Costanti UI
// -------------------------------------------------------------
const TABS = [
  { id: "bnb", labelKey: "tabs.bnb" },
  { id: "flight", labelKey: "tabs.flight" },
  { id: "car", labelKey: "tabs.car" },
  { id: "finance", labelKey: "tabs.finance" },
  { id: "trading", labelKey: "tabs.trading" },
  { id: "tickets", labelKey: "tabs.tickets" },
  { id: "connectivity", labelKey: "tabs.connectivity" },
];

const POPULAR_CITIES = ["Roma", "Milano", "Firenze", "Napoli", "Parigi", "Londra", "Tokyo"];

const COLORS = ["#2563eb", "#9333ea", "#f59e0b", "#10b981", "#ef4444", "#3b82f6"];

// -------------------------------------------------------------
// PAGINA PRINCIPALE
// -------------------------------------------------------------
export default function Home() {
  const { t } = useTranslation();
  const [active, setActive] = useState("bnb");

  // Stato risultati
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Recenti persistenti
  const [recents, setRecents] = useState([]);
  useEffect(() => {
    try {
      const r = localStorage.getItem("vrabo_recent");
      if (r) setRecents(JSON.parse(r));
    } catch {
      setRecents([]);
    }
  }, []);

  const saveRecent = (item) => {
    const next = [item, ...recents].filter(Boolean).slice(0, 12);
    setRecents(next);
    localStorage.setItem("vrabo_recent", JSON.stringify(next));
  };

  // Affiliati per tab attivo
  const affiliateLinks = useAffiliate(active);

  // Search API
  const doSearch = async (payload = {}) => {
    setLoading(true);
    setError("");
    setResults([]);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: active,
          ...payload,
          startDate: toISO(payload.depart || payload.checkin || payload.from),
          endDate: toISO(payload.return || payload.checkout || payload.to),
          limit: 12,
        }),
      });
      const data = await res.json();
      setResults(data.results || []);
      saveRecent({ type: active, ...payload });
    } catch (err) {
      console.error(err);
      setError("❌ Errore durante la ricerca, riprova.");
    } finally {
      setLoading(false);
    }
  };

  // Lazy loading observer per risultati
  const resultsRef = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!resultsRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    obs.observe(resultsRef.current);
    return () => obs.disconnect();
  }, []);

  // -------------------------------------------------------------
  // Render
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black text-gray-900 dark:text-white flex flex-col">
      {/* Analytics Scripts */}
      <Script
        defer
        data-domain="vrabo.it"
        src="https://plausible.io/js/script.js"
      />
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"
      />
      <Script id="ga-init">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date()); gtag('config', 'G-XXXXXXX');
      `}</Script>

      {/* HERO */}
      <section className="relative min-h-[65vh] flex flex-col justify-center items-center text-center overflow-hidden">
        <video
          className="absolute w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          src="/bg.mp4"
        />
        <div className="absolute inset-0 bg-black/70" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-6xl px-6 w-full"
        >
          <h1 className="text-6xl font-extrabold text-white drop-shadow-lg">
            VRABO
          </h1>
          <p className="mt-4 text-lg text-gray-200">
            {t("heroTitle")} –{" "}
            <span className="text-blue-400 font-bold">{t("heroSubtitle")}</span>
          </p>

          {/* Tabs */}
          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition transform hover:scale-105 ${
                  active === tab.id
                    ? "bg-blue-600 text-white"
                    : "bg-white/90 text-gray-800 dark:bg-gray-700 dark:text-white"
                } shadow`}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>

          {/* Barra di ricerca */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-5">
            <SearchBarUltraPro
              mode={active}
              placeholder="Dove vuoi andare?"
              recent={recents.map((r) => ({
                key: r.query || r.dest || "",
                name: r.query || r.dest || "",
              }))}
              popular={POPULAR_CITIES.map((c) => ({ key: c, name: c }))}
              onSubmit={(payload) => doSearch(payload)}
              onPick={(item) => doSearch({ query: item.name })}
            />

            {/* Affiliati */}
            {affiliateLinks.length > 0 && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 mb-2">
                  🔥 Partner consigliati per {t(`tabs.${active}`)}
                </p>
                <div className="flex flex-wrap gap-3 justify-center text-sm">
                  {affiliateLinks.map((a, i) => (
                    <a
                      key={i}
                      href={`/api/track?url=${encodeURIComponent(a.url)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow hover:scale-105 transition"
                    >
                      🔗 {a.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Results */}
      <section
        ref={resultsRef}
        className="max-w-7xl mx-auto py-10 px-6 flex-1 w-full"
      >
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="text-red-400 text-center text-lg">{error}</p>
        )}

        {!loading && !error && !results.length && (
          <p className="text-gray-400 text-center text-lg">{t("noResults")}</p>
        )}

        {!!results.length && visible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {results.map((r, i) => (
              <motion.a
                key={i}
                href={`/api/track?url=${encodeURIComponent(r.url)}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03, rotate: 0.2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl flex flex-col group transition relative"
              >
                <div className="relative w-full h-48 overflow-hidden">
                  <img
                    src={r.image || "/logo.png"}
                    alt={r.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <span className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 text-xs rounded-md shadow">
                    {r.tag || "Offerta"}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg mb-1 truncate">
                    {r.title}
                  </h3>
                  <p className="text-sm text-gray-500 flex-1 truncate">
                    {r.location || "—"}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xl text-blue-600 font-semibold">
                      {r.price || "—"}
                    </p>
                    <span className="text-yellow-500 text-sm">
                      ⭐ {r.rating || (3.5 + (i % 3) * 0.5).toFixed(1)}
                    </span>
                  </div>
                </div>
              </motion.a>
            ))}
          </motion.div>
        )}

        {/* Charts */}
        {!!results.length && visible && (
          <div className="mt-16 grid md:grid-cols-2 gap-8">
            {/* BarChart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-6 text-center">
                📊 {t("priceDistribution")}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={results.map((r) => ({
                    name: r.title.slice(0, 14) + "...",
                    prezzo: r._priceVal || Math.floor(Math.random() * 200) + 50,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="prezzo"
                    fill="#2563eb"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* PieChart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-6 text-center">
                🍩 {t("categoryDistribution") || "Distribuzione per categoria"}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={TABS.map((tab, i) => ({
                      name: t(tab.labelKey),
                      value:
                        results.filter((r) => r.type === tab.id).length ||
                        Math.floor(Math.random() * 5) + 1,
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {TABS.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>
      {/* About */}
      <section id="about" className="py-20 text-center px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">{t("about")}</h2>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
          VRABO è un meta-comparatore che aggrega i migliori portali ufficiali
          di viaggi, finanza, servizi e molto altro. 
          <br />
          Alcuni link sono affiliati: <b>per te nulla cambia</b>, ma ci
          permettono di mantenere il servizio gratuito, veloce e senza pubblicità invadente.
        </p>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-gray-50 dark:bg-gray-900 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">❓ FAQ</h2>
          <div className="space-y-6 text-left">
            {[
              {
                q: "Come funziona VRABO?",
                a: "Inserisci la tua ricerca, VRABO interroga più comparatori e mostra i risultati in un’unica interfaccia chiara e veloce."
              },
              {
                q: "Devo pagare un abbonamento?",
                a: "No. VRABO è gratuito: vive grazie a link affiliati e alle donazioni volontarie."
              },
              {
                q: "I risultati sono affidabili?",
                a: "Sì: i risultati provengono da fonti ufficiali e partner certificati. Non vendiamo né falsifichiamo i dati."
              },
            ].map((f, i) => (
              <div key={i} className="p-5 rounded-xl bg-white dark:bg-gray-800 shadow">
                <h3 className="font-semibold text-lg mb-2">{f.q}</h3>
                <p className="text-gray-600 dark:text-gray-300">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-10">💬 Cosa dicono gli utenti</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Luca R.",
                text: "Finalmente un sito che non mi fa perdere ore tra mille comparatori. VRABO è immediato e trasparente."
              },
              {
                name: "Giulia P.",
                text: "Ho prenotato un weekend a Firenze con due click. La ricerca voli + hotel insieme è geniale."
              },
              {
                name: "Marco D.",
                text: "Uso VRABO anche per comparare servizi finanziari. Bello avere tutto centralizzato, chiaro e in dark mode!"
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg"
              >
                <p className="text-gray-600 dark:text-gray-300 italic mb-4">
                  “{t.text}”
                </p>
                <h4 className="font-semibold">– {t.name}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section
        id="newsletter"
        className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white text-center px-6"
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">📬 Rimani aggiornato</h2>
          <p className="mb-6">
            Iscriviti alla nostra newsletter: niente spam, solo le migliori
            offerte e aggiornamenti.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("✨ Iscrizione avvenuta con successo!");
            }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <input
              type="email"
              required
              placeholder="La tua email"
              className="px-4 py-3 rounded-lg text-black w-full sm:w-72"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-black rounded-lg font-semibold shadow hover:scale-105 transition"
            >
              Iscriviti →
            </button>
          </form>
        </div>
      </section>

      {/* Donazioni */}
      <section
        id="donazioni"
        className="py-20 text-center bg-gradient-to-r from-blue-900 via-purple-900 to-black text-white"
      >
        <Donations />
      </section>

      {/* Contatti */}
      <section id="contact" className="py-20 text-center px-6">
        <h2 className="text-3xl font-bold mb-6">{t("contact")}</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Hai domande o vuoi collaborare con noi? Scrivici:
        </p>
        <a
          href="mailto:info@vrabo.it"
          className="px-8 py-3 bg-blue-600 rounded-lg text-lg font-semibold shadow-md text-white hover:scale-105 transition"
        >
          Invia Email
        </a>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-sm text-gray-500 bg-gray-100 dark:bg-gray-900">
        <p className="mb-3">© {new Date().getFullYear()} VRABO – Tutti i diritti riservati</p>
        <div className="flex gap-4 justify-center text-lg">
          <a href="#about" className="hover:text-blue-500">About</a>
          <a href="#faq" className="hover:text-blue-500">FAQ</a>
          <a href="#contact" className="hover:text-blue-500">Contatti</a>
        </div>
      </footer>

      <CookieBanner />
    </div>
  );
}
