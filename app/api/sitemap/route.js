import { NextResponse } from "next/server";

export async function GET() {
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

  // Mock dynamic routes (in futuro: fetch da DB/API)
  const cities = ["roma", "milano", "napoli", "parigi", "londra", "tokyo"];
  const dynamicRoutes = cities.map((c) => `/bnb/${c}`);

  // Costruzione URL finali
  const urls = [
    ...staticPages.map((u) => `${base}${u}`),
    ...sections.map((s) => `${base}/${s}`),
    ...dynamicRoutes.map((u) => `${base}${u}`),
  ];

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

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
