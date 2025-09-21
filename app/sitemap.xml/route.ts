import { NextResponse, NextRequest } from "next/server";
export async function GET(req: NextRequest) {
  const { origin } = new URL(req.url);
  const pages = ["","/donate","/legal/privacy","/legal/terms","/legal/cookie","/services/flights","/services/hotels","/services/cars","/services/trains","/services/events","/services/connectivity","/services/shopping"];
  const urls = pages.map(p=>`${origin}${p}`);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u=>`<url><loc>${u}</loc></url>`).join("")}
</urlset>`;
  return new NextResponse(body, { headers: { "content-type":"application/xml" }});
}
