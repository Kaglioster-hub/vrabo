"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import SearchBarUltraPro, { Item } from "@/components/SearchBarUltraPro";

/* ============================================================
   Tabs definiti e tipizzati
============================================================ */
export const TABS = [
  { id: "bnb", labelKey: "tabs.bnb" },
  { id: "flight", labelKey: "tabs.flight" },
  { id: "car", labelKey: "tabs.car" },
  { id: "finance", labelKey: "tabs.finance" },
  { id: "trading", labelKey: "tabs.trading" },
  { id: "tickets", labelKey: "tabs.tickets" },
  { id: "connectivity", labelKey: "tabs.connectivity" },
] as const;

export type TabId = (typeof TABS)[number]["id"];

/* ============================================================
   Props
============================================================ */
interface HeroProps {
  active?: TabId;
  setActive?: (tab: TabId) => void;
  onSearch?: (payload: any) => void;
  recents?: Item[];
  popular?: Item[];
}

/* ============================================================
   Component
============================================================ */
export default function Hero({
  active,
  setActive,
  onSearch,
  recents = [],
  popular = [],
}: HeroProps) {
  const { t } = useTranslation();

  const [localTab, setLocalTab] = useState<TabId>(active || "bnb");
  const isControlled = active !== undefined && typeof setActive === "function";
  const tab = isControlled ? (active as TabId) : localTab;
  const setTab = isControlled ? (setActive as (tab: TabId) => void) : setLocalTab;

  const searchMode = useMemo(() => {
    if (tab === "bnb") return "bnb";
    if (tab === "flight") return "flight";
    if (tab === "car") return "car";
    return "general";
  }, [tab]);

  return (
    <section className="relative min-h-screen flex items-center justify-center text-center bg-gradient-to-b from-vrabo-blue via-vrabo-purple to-vrabo-pink">
      {/* Glow morbido */}
      <div className="hero-glow" aria-hidden="true" />

      {/* Contenuto */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-3xl px-6 flex flex-col items-center"
      >
        {/* Logo + title */}
        <img
          src="/logo.svg"
          alt="VRABO"
          width={96}
          height={96}
          className="w-24 h-24 bg-black dark:bg-white rounded-2xl p-2 shadow-lg"
        />
        <h1 className="mt-4 text-5xl md:text-6xl font-extrabold text-white tracking-tight">
          VRABO
        </h1>
        <p className="mt-3 max-w-xl text-base md:text-lg text-gray-200">
          {t("heroTitle")} —{" "}
          <span className="font-semibold text-vrabo-gold">
            {t("heroSubtitle")}
          </span>
        </p>

        {/* Tabs */}
        <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-xl">
          {TABS.map((tdef) => {
            const activeTab = tab === tdef.id;
            return (
              <button
                key={tdef.id}
                onClick={() => setTab(tdef.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition border shadow-sm ${
                  activeTab
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white/90 text-gray-800 dark:bg-gray-800/90 dark:text-white border-gray-300 dark:border-gray-700"
                }`}
                aria-pressed={activeTab}
              >
                {t(tdef.labelKey)}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="mt-8 w-full">
          <div className="bg-white/95 dark:bg-gray-900/90 rounded-2xl shadow-xl p-5 backdrop-blur supports-backdrop:bg-white/70">
            <SearchBarUltraPro
              mode={searchMode as any}
              placeholder={t("search.placeholder", "Dove vuoi andare?")}
              recent={recents}
              popular={popular}
              onSubmit={(payload) => {
                if (onSearch) onSearch({ type: tab, ...payload });
              }}
              className="!p-0 bg-transparent shadow-none"
            />
          </div>
        </div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-8 text-white/70 text-sm"
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          ↓ {t("scrollDown", "Scorri per vedere di più")}
        </motion.div>
      </motion.div>
    </section>
  );
}
