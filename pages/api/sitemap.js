export default async function handler(req, res) {
  const base = "https://vrabo.it";
  const sections = ["bnb", "flight", "car", "finance", "trading"];
  const staticPages = ["/", "/about", "/contact", "/donazioni"];

  const urls = [
    ...staticPages.map((u) => `${base}${u}`),
    ...sections.map((s) => `${base}/${s}`),
  ];

  res.setHeader("Content-Type", "application/xml");
  res.write(`<?xml version="1.0" encoding="UTF-8"?>`);
  res.write(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`);
  urls.forEach((u) => {
    res.write(`
      <url>
        <loc>${u}</loc>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
      </url>
    `);
  });
  res.write(`</urlset>`);
  res.end();
}
