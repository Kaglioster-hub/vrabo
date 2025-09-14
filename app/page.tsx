"use client";

/* ============================================================
   VRABO – Main Page (Next.js App Router)
   ------------------------------------------------------------
   - Client component
   - React hooks + framer-motion
   - TSX fully typed
   - SEO + accessibility + DX optimized
============================================================ */

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, MotionProps } from "framer-motion";
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
} from "recharts";

// i18n
import "@/app/i18n";
import { useTranslation } from "react-i18next";

// Components
import Navbar from "@/components/navbar";
import Hero from "@/components/Hero";
import ResultsSection from "@/components/ResultsSection";
import Charts from "@/components/Charts";
import AboutSection from "@/components/AboutSection";
import FAQSection from "@/components/FAQSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import NewsletterSection from "@/components/NewsletterSection";
import DonationsSection from "@/components/DonationsSection";
import ContactSection from "@/components/ContactSection";
import FooterSection from "@/components/FooterSection";
import SearchBarUltraPro, { Item } from "@/components/SearchBarUltraPro";
import CookieBanner from "@/components/CookieBanner";
import SkeletonCard from "@/components/SkeletonCard";

// Utils & Hooks
import { toISO } from "@/utils/helpers";
import useAffiliate from "@/hooks/useAffiliate";

// Motion aliases
const MotionDiv: React.ComponentType<
  React.HTMLAttributes<HTMLDivElement> & MotionProps
> = motion.div;

/* ============================================================
   Types
============================================================ */

type ResultItem = {
  url?: string;
  image?: string;
  title?: string;
  tag?: string;
  location?: string;
  price?: string;
  rating?: number;
  type?: string;
  _priceVal?: number;
};

type AffiliateLink = {
  name: string;
  url: string;
};

/* ============================================================
   Tabs
============================================================ */

const TABS = [
  { id: "bnb", labelKey: "tabs.bnb" },
  { id: "flight", labelKey: "tabs.flight" },
  { id: "car", labelKey: "tabs.car" },
  { id: "finance", labelKey: "tabs.finance" },
  { id: "trading", labelKey: "tabs.trading" },
  { id: "tickets", labelKey: "tabs.tickets" },
  { id: "connectivity", labelKey: "tabs.connectivity" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const POPULAR_CITIES = [
  "Roma",
  "Milano",
  "Firenze",
  "Napoli",
  "Parigi",
  "Londra",
  "Tokyo",
];

/* ============================================================
   Component – Main Page
============================================================ */
export default function Home() {
  const { t } = useTranslation();

  // State
  const [active, setActive] = useState<TabId>("bnb");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recents, setRecents] = useState<Item[]>([]);
  const [visible, setVisible] = useState(false);

  // Load recents
  useEffect(() => {
    try {
      const stored = localStorage.getItem("vrabo_recent");
      if (stored) setRecents(JSON.parse(stored));
    } catch {
      setRecents([]);
    }
  }, []);

  const saveRecent = useCallback(
    (item: Item) => {
      const next = [item, ...recents].filter(Boolean).slice(0, 12);
      setRecents(next);
      localStorage.setItem("vrabo_recent", JSON.stringify(next));
    },
    [recents]
  );

  const affiliateLinks: AffiliateLink[] = useAffiliate(active);

  // API search
  const doSearch = useCallback(
    async (payload: any = {}) => {
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

        saveRecent({
          key: payload.query || payload.dest || "–",
          name: payload.query || payload.dest || "–",
        });
      } catch (err) {
        console.error(err);
        setError("❌ Errore durante la ricerca, riprova.");
      } finally {
        setLoading(false);
      }
    },
    [active, saveRecent]
  );

  // Lazy load Results
  const resultsRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!resultsRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && setVisible(true),
      { threshold: 0.2 }
    );
    obs.observe(resultsRef.current);
    return () => obs.disconnect();
  }, []);

  /* ============================================================
     Render
  ============================================================ */
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-900 dark:bg-black dark:text-white">
      {/* Navbar */}
      <Navbar />

      {/* Analytics */}
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
        gtag('js', new Date());
        gtag('config', 'G-XXXXXXX');
      `}</Script>

      {/* Hero */}
      <Hero
        active={active}
        setActive={setActive}
        recents={recents}
        onSearch={doSearch}   // ✅ fix
        affiliateLinks={affiliateLinks}
      />

      {/* Results */}
      <ResultsSection
        resultsRef={resultsRef}
        results={results}
        loading={loading}
        error={error}
        visible={visible}
        t={t}
      />

      {/* Charts */}
      <Charts results={results} visible={visible} t={t} />

      {/* Sections */}
      <AboutSection t={t} />
      <FAQSection />
      <TestimonialsSection />
      <NewsletterSection />
      <DonationsSection />
      <ContactSection t={t} />
      <FooterSection />

      {/* Cookie Banner */}
      <CookieBanner />
    </div>
  );
}
