"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function CookieBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const bannerRef = useRef(null);

  useEffect(() => {
    const v = localStorage.getItem("vrabo_cookie");
    if (v !== "yes") setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("vrabo_cookie", "yes");
    setVisible(false);
  };

  // Chiudi con tastiera
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Enter" && visible) accept();
      if (e.key === "Escape" && visible) setVisible(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={bannerRef}
          key="cookie-banner"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 15 }}
          role="dialog"
          aria-modal="true"
          aria-label="Cookie consent"
          aria-describedby="cookie-text"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 max-w-3xl w-[95%] 
                     bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border 
                     border-gray-300 dark:border-gray-700 
                     text-gray-900 dark:text-gray-100 shadow-2xl rounded-2xl 
                     p-5 flex flex-col md:flex-row items-center justify-between gap-4 z-[9999]"
        >
          {/* Testo */}
          <span id="cookie-text" className="text-sm leading-snug text-center md:text-left">
            🍪 {t("cookie.text")}{" "}
            <a
              href="/privacy"
              className="underline font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700"
            >
              {t("cookie.policy")}
            </a>
            .
          </span>

          {/* Bottoni */}
          <div className="flex gap-2">
            <button
              onClick={accept}
              autoFocus
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 
                         rounded-lg font-semibold text-white 
                         shadow-lg transition focus:outline-none 
                         focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              {t("cookie.accept")}
            </button>
            <button
              onClick={() => setVisible(false)}
              aria-label="Chiudi banner cookie"
              className="px-5 py-2 bg-gray-200 hover:bg-gray-300 
                         dark:bg-gray-800 dark:hover:bg-gray-700 
                         rounded-lg font-medium text-gray-700 dark:text-gray-300
                         transition focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
