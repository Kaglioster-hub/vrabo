"use client";

import React from "react";
import { useTranslation } from "react-i18next";

export default function AboutSection({ t }: { t: ReturnType<typeof useTranslation>["t"] }) {
  return (
    <section className="py-16 px-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-extrabold mb-4">{t("about")}</h2>
      <p className="text-lg text-gray-700 dark:text-gray-300">
        VRABO è un metacomparatore: cerca offerte su più categorie e ti aiuta a
        decidere in modo informato. Nessun paywall, niente account obbligatori.
        Solo strumenti utili, filtri semplici e link trasparenti.
      </p>
    </section>
  );
}
