"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import SearchBarUltraPro from "@/components/SearchBarUltraPro";

const TABS = [
  { id: "bnb",          i18n: "tabs.bnb" },
  { id: "flight",       i18n: "tabs.flight" },
  { id: "car",          i18n: "tabs.car" },
  { id: "finance",      i18n: "tabs.finance" },
  { id: "trading",      i18n: "tabs.trading" },
  { id: "tickets",      i18n: "tabs.tickets" },
  { id: "connectivity", i18n: "tabs.connectivity" },
];

export default function Hero({
  /** opzionali: puoi controllare tab e submit dal parent */
  active,
  setActive,
  onSearch,
  recents = [],
  popular = [],
}) {
  const { t } = useTranslation();

  // controlled vs uncontrolled
  const [localTab, setLocalTab] = useState(active || "bnb");
  const isControlled = typeof active !== "undefined" && typeof setActive === "function";
  const tab = isControlled ? active : localTab;
  const setTab = isControlled ? setActive : setLocalTab;

  // mappatura tab → modalità della searchbar
  const searchMode = useMemo(() => {
    if (tab === "bnb") return "bnb";
    if (tab === "flight") return "flight";
    if (tab === "car") return "car";
    return "general";
  }, [tab]);

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center text-center overflow-hidden">
      {/* Background video + overlay */}
      <video
        className="video-cover"
        autoPlay
        loop
        muted
        playsInline
        poster="/hero.jpg"
        src="/bg.mp4"
      />
      <div className="hero-overlay" />

      {/* Glow morbido dietro al blocco */}
      <div className="hero-glow" aria-hidden="true" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-4xl px-6"
      >
        {/* Logo + title */}
        <div className="flex flex-col items-center gap-4">
          <img
            src="/logo.svg"
            alt="VRABO"
            width={84}
            height={84}
            className="logo w-[84px] h-[84px] bg-black rounded-2xl p-2"
          />
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
            VRABO
          </h1>
          <p className="mt-2 text-sm md:text-base text-gray-200">
            {t("heroTitle")} —{" "}
            <span className="font-semibold text-blue-400">
              {t("heroSubtitle")}
            </span>
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {TABS.map((tdef) => {
            const activeTab = tab === tdef.id;
            return (
              <button
                key={tdef.id}
                onClick={() => setTab(tdef.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs md:text-sm font-semibold shadow
                  transition hover:scale-105 border
                  ${activeTab
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white/90 text-gray-800 dark:bg-gray-800/90 dark:text-white border-white/20 dark:border-white/10"
                  }`}
                aria-pressed={activeTab}
              >
                {t(tdef.i18n)}
              </button>
            );
          })}
        </div>

        {/* Search card */}
        <div className="mt-5 bg-white/95 dark:bg-gray-900/90 rounded-2xl shadow-elev-lg p-4 md:p-5 backdrop-blur supports-backdrop:bg-white/70">
          <SearchBarUltraPro
            mode={searchMode}
            placeholder="Dove vuoi andare?"
            recent={recents}
            popular={popular}
            onSubmit={(payload) => {
              if (onSearch) onSearch({ type: tab, ...payload });
            }}
            className="!p-0 bg-transparent shadow-none"
          />
        </div>
      </motion.div>
    </section>
  );
}
