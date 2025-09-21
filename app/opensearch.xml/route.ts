import { NextResponse, NextRequest } from "next/server";
export async function GET(req: NextRequest) {
  const { origin } = new URL(req.url);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>VRABO</ShortName>
  <Description>VRABO ricerca prodotti (Amazon) via comparatore.</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Url type="text/html" template="${origin}/api/go?to=amazon&amp;type=partner&amp;q={{searchTerms}}"/>
</OpenSearchDescription>`;
  return new NextResponse(xml, { headers: { "content-type": "application/opensearchdescription+xml" }});
}
