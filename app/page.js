// app/page.js
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
} from "recharts";

// Import i18n config (inizializzazione unica)
import "@/app/i18n";
import { useTranslation } from "react-i18next";

// Componenti modularizzati
import SearchBarUltra from "@/components/SearchBarUltra";
import Donations from "@/components/Donations";
import CookieBanner from "@/components/CookieBanner";
import GuestsStepper from "@/components/GuestsStepper";
import SkeletonCard from "@/components/SkeletonCard";

// Utils centralizzate
import { clamp, toISO } from "@/utils/helpers";

// Affiliati dinamici
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

// -------------------------------------------------------------
// PAGINA PRINCIPALE
// -------------------------------------------------------------
export default function Home() {
  const { t } = useTranslation();
  const [active, setActive] = useState("bnb");

  // Stato ricerca
  const [query, setQuery] = useState("");
  const [selectedSug, setSelectedSug] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [guests, setGuests] = useState(2);

  // Stato risultati
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Recenti persistenti
  const [recents, setRecents] = useState([]);
  useEffect(() => {
    const r = localStorage.getItem("vrabo_recent");
    if (r) setRecents(JSON.parse(r));
  }, []);

  const saveRecent = (item) => {
    const next = [item, ...recents].slice(0, 8);
    setRecents(next);
    localStorage.setItem("vrabo_recent", JSON.stringify(next));
  };

  // Affiliati per tab attivo
  const affiliateLinks = useAffiliate(active);

  // Search API
  const doSearch = async () => {
    setLoading(true);
    setError("");
    setResults([]);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: active,
          query,
          queryCode: selectedSug?.code || "",
          startDate: toISO(startDate),
          endDate: toISO(endDate),
          guests,
          limit: 12,
        }),
      });
      const data = await res.json();
      setResults(data.results || []);
      saveRecent({ type: active, query, startDate, endDate, guests });
    } catch {
      setError("Errore nella ricerca.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Render
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black text-gray-900 dark:text-white flex flex-col">
      {/* HERO */}
      <section className="relative min-h-[60vh] flex flex-col justify-center items-center text-center overflow-hidden">
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
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  active === tab.id
                    ? "bg-blue-600 text-white"
                    : "bg-white/90 text-gray-800"
                } shadow`}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>

          {/* SearchBarUltra + Form */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-5">
            <SearchBarUltra
              mode={active}
              placeholder="Dove vuoi andare?"
              recent={recents.map((r) => ({ key: r.query, name: r.query }))}
              popular={POPULAR_CITIES.map((c) => ({ key: c, name: c }))}
              onSubmit={(val) => {
                setQuery(val);
                doSearch();
              }}
              onPick={(item) => {
                setQuery(item.name);
                setSelectedSug(item);
                doSearch();
              }}
            />

            {/* Date + Guests */}
            <div className="mt-3 flex flex-wrap gap-3 justify-center">
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                placeholderText="Check-in"
                className="px-4 py-3 rounded-lg border text-black w-40"
              />
              <DatePicker
                selected={endDate}
                onChange={setEndDate}
                placeholderText="Check-out"
                className="px-4 py-3 rounded-lg border text-black w-40"
              />
              {(active === "bnb" || active === "car") && (
                <GuestsStepper value={guests} onChange={setGuests} />
              )}
              <button
                onClick={doSearch}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow"
              >
                {t("search")} →
              </button>
            </div>

            {/* Affiliati consigliati */}
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
      <section className="max-w-7xl mx-auto py-10 px-6 flex-1">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}
        {!loading && error && <p className="text-red-400">{error}</p>}
        {!loading && !error && !results.length && (
          <p className="text-gray-400">{t("noResults")}</p>
        )}

        {!!results.length && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {results.map((r, i) => (
              <motion.a
                key={i}
                href={`/api/track?url=${encodeURIComponent(r.url)}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl flex flex-col"
              >
                <img
                  src={r.image || "/logo.png"}
                  alt={r.title}
                  className="w-full h-44 object-cover"
                />
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg mb-1">{r.title}</h3>
                  <p className="text-sm text-gray-500 flex-1">{r.location}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xl text-blue-600 font-semibold">
                      {r.price || "—"}
                    </p>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        )}

        {!!results.length && (
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4">📊 Distribuzione prezzi</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={results.map((r) => ({
                  name: r.title.slice(0, 12) + "...",
                  prezzo: r._priceVal || 0,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="prezzo" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* About */}
      <section id="about" className="py-16 text-center px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">{t("about")}</h2>
        <p className="text-gray-600 dark:text-gray-300">
          VRABO è un meta-comparatore che aggrega i migliori comparatori
          ufficiali. Alcuni link sono affiliati: <b>per te nulla cambia</b>, noi
          riceviamo una commissione che mantiene il servizio gratuito.
        </p>
      </section>

      {/* Donazioni */}
      <section
        id="donazioni"
        className="py-16 text-center bg-gradient-to-r from-blue-900 via-purple-900 to-black text-white"
      >
        <Donations />
      </section>

      {/* Contatti */}
      <section id="contact" className="py-16 text-center px-6">
        <h2 className="text-3xl font-bold mb-6">{t("contact")}</h2>
        <a
          href="mailto:info@vrabo.it"
          className="px-8 py-3 bg-blue-600 rounded-lg text-lg font-semibold shadow-md text-white"
        >
          Invia Email
        </a>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500 bg-gray-100 dark:bg-gray-900">
        <p>© {new Date().getFullYear()} VRABO – Tutti i diritti riservati</p>
      </footer>

      <CookieBanner />
    </div>
  );
}
