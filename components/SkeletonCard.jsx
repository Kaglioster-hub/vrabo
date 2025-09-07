"use client";

export default function SkeletonCard({
  compact = false,     // compatta la card
  showCta = true,      // mostra il bottone finto
  className = "",
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md flex flex-col transform transition hover:scale-[1.01] ${className}`}
    >
      {/* Immagine placeholder */}
      <div className="relative w-full bg-gray-200 dark:bg-gray-700 skeleton" style={{ height: compact ? 140 : 192 }}>
        {/* Badge finto */}
        <div className="absolute top-3 left-3 h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded-full skeleton" />
        {/* Icona preferiti */}
        <div className="absolute top-3 right-3 h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded-full skeleton" />
      </div>

      {/* Contenuto */}
      <div className="p-5 flex-1 flex flex-col space-y-3">
        {/* Titolo */}
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 skeleton" />

        {/* Location / sottotitolo */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 skeleton" />

        {/* Linea descrizione breve */}
        {!compact && <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 skeleton" />}

        {/* Prezzo + rating */}
        <div className="flex items-center justify-between mt-auto">
          <div className="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded-md skeleton" />
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full skeleton" />
            <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded skeleton" />
          </div>
        </div>

        {/* Bottone CTA finto */}
        {showCta && <div className="mt-4 h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg skeleton" />}

        {/* sr-only per screen reader */}
        <span className="sr-only">Caricamento…</span>
      </div>
    </div>
  );
}

/* Helper opzionale: griglia di skeleton */
export function SkeletonCards({ count = 6, ...props }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} {...props} />
      ))}
    </div>
  );
}
