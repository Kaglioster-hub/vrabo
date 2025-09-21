// app/head.tsx
export default function Head() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://vrabo.it";

  const jsonld = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "VRABO",
    "url": base,
    "logo": base + "/icon.svg",
    "sameAs": [base]
  };

  const jsonld2 = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": base,
    "potentialAction": {
      "@type": "SearchAction",
      "target": base + "/api/go?to=amazon&type=partner&q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#0ea5e9" />
      <meta property="og:site_name" content="VRABO" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="VRABO — Comparatore dei comparatori" />
      <meta property="og:description" content="Non sceglie per te: sceglie con te." />
      <link rel="manifest" href="/manifest.json" />
      <link rel="icon" href="/icon.svg" />
      <link rel="search" type="application/opensearchdescription+xml" title="VRABO" href="/opensearch.xml" />

      {/* 👇 Qui servono due graffe: {{ __html: ... }} */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld2) }}
      />
    </>
  );
}

