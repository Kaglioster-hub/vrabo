"use client";

import React from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import SkeletonCard from "@/components/SkeletonCard";

type ResultItem = {
  url?: string;
  image?: string;
  title?: string;
  tag?: string;
  location?: string;
  price?: string;
  rating?: number;
};

export default function ResultsSection({
  resultsRef,
  results,
  loading,
  error,
  visible,
  t,
}: {
  resultsRef: React.RefObject<HTMLDivElement | null>;
  results: ResultItem[];
  loading: boolean;
  error: string;
  visible: boolean;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <section ref={resultsRef} className="py-12 px-6 max-w-6xl w-full mx-auto">
      <h2 className="text-2xl font-bold mb-6">Risultati</h2>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
          {error}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && results?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {results.map((item, i) => (
            <article key={i} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md flex flex-col">
              <div className="relative w-full" style={{ height: 192 }}>
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title || "Risultato"}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700" />
                )}
                {item.tag && (
                  <span className="absolute top-3 left-3 badge badge-info">{item.tag}</span>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col gap-2">
                <h3 className="text-lg font-semibold line-clamp-2">{item.title || ""}</h3>
                {item.location && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.location}</p>
                )}
                <div className="mt-auto flex items-center justify-between">
                  <div className="text-blue-600 dark:text-blue-400 font-bold">{item.price || ""}</div>
                  {typeof item.rating === "number" && (
                    <div className="text-sm text-gray-600 dark:text-gray-300">★ {item.rating.toFixed(1)}</div>
                  )}
                </div>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 btn-gradient rounded-xl py-2"
                    aria-label={`Apri ${item.title || "risultato"}`}
                  >
                    Scopri
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && visible && (!results || results.length === 0) && !error && (
        <p className="text-center text-gray-500 dark:text-gray-400">{t("noResults")}</p>
      )}
    </section>
  );
}
