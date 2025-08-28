// pages/api/sitemap.js
// =============================================================
// VRABO – Sitemap Generator SUPREME 1000x
// - Statiche + sezioni dinamiche + SEO best practices
// =============================================================

export default async function handler(req, res) {
  const base = "https://vrabo.it";
  const now = new Date().toISOString();

  // Pagine statiche principali
  const staticPages = ["/", "/about", "/contact", "/donazioni", "/privacy"];

  // Sezioni macro
  const sections = [
    "bnb",
    "flight",
    "car",
    "finance",
    "trading",
    "tickets",
    "connectivity",
    "ecommerce",
    "insurance",
    "software",
    "education",
    "energy",
  ];

  // Se in futuro hai dynamic route (es. /bnb/[city]) puoi generarle qui
  // mock cities (in futuro fetch dal DB o API)
  const cities = ["roma", "milano", "napoli", "parigi", "londra", "tokyo"];
  const dynamicRoutes = cities.map((c) => `/bnb/${c}`);

  // Costruzione URL finali
  const urls = [
    ...staticPages.map((u) => `${base}${u}`),
    ...sections.map((s) => `${base}/${s}`),
    ...dynamicRoutes.map((u) => `${base}${u}`),
  ];

  // Header SEO/XML
  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");

  // XML Sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls
      .map(
        (u) => `
      <url>
        <loc>${u}</loc>
        <lastmod>${now}</lastmod>
        <changefreq>daily</changefreq>
        <priority>${u === base ? "1.0" : "0.7"}</priority>
      </url>`
      )
      .join("")}
  </urlset>`;

  res.end(sitemap);
}
