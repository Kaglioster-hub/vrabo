"use client";

import React from "react";
import { useTranslation } from "react-i18next";

export default function ContactSection({ t }: { t: ReturnType<typeof useTranslation>["t"] }) {
  return (
    <section className="py-12 px-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{t("contact")}</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-3">
        Per segnalazioni, partnership o feedback scrivi a{" "}
        <a className="text-blue-600 dark:text-blue-400 underline" href="mailto:hello@vrabo.it">
          hello@vrabo.it
        </a>.
      </p>
    </section>
  );
}
