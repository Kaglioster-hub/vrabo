import { NextResponse, NextRequest } from "next/server";
import { buildFlightLink, buildHotelLink, buildCarLink } from "@/utils/deeplinks";

export const runtime = "edge";

const hex=(n=12)=> Array.from(crypto.getRandomValues(new Uint8Array(n)), b=>b.toString(16).padStart(2,"0")).join("");
const newCid=()=> "c_"+hex(8);

function withParams(u: URL, pairs: Record<string,string|undefined>) {
  Object.entries(pairs).forEach(([k,v])=>{ if(v) u.searchParams.set(k, v); });
}

function subParam(prov: string) {
  const map: Record<string,string> = {
    KIWI:"aff_sub", KAYAK:"affcid", MOMONDO:"clickid", SKYSCANNER:"clickid",
    EXPEDIA:"cid", BOOKING:"aid", RENTALCARS:"affiliateCode", DISCOVERCARS:"a", QEEQ:"ref"
  };
  return (process.env["AFF_SUB_PARAM_"+prov] || map[prov] || "subid");
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = (url.searchParams.get("mode") || "flight") as "flight"|"stay"|"car"|"telco"|"finance";
  const prov = (url.searchParams.get("prov") || "").toUpperCase();

  const old = req.cookies.get("vrabo_sid")?.value;
  const sid = old || ("sid_"+hex(10));
  const cid = newCid();

  let target = "";
  if (mode==="flight") {
    target = buildFlightLink(prov, {
      from: url.searchParams.get("from")||"",
      to: url.searchParams.get("to")||"",
      depart: url.searchParams.get("depart")||"",
      ret: url.searchParams.get("ret")||"",
      adults: url.searchParams.get("adults")||"1"
    });
  } else if (mode==="stay") {
    target = buildHotelLink(prov, {
      city: url.searchParams.get("city")||url.searchParams.get("to")||"",
      checkin: url.searchParams.get("checkin")||url.searchParams.get("depart")||"",
      checkout: url.searchParams.get("checkout")||url.searchParams.get("ret")||"",
      adults: url.searchParams.get("adults")||"1"
    });
  } else if (mode==="car") {
    target = buildCarLink(prov, {
      city: url.searchParams.get("city")||url.searchParams.get("to")||"",
      pickup: url.searchParams.get("pickup")||url.searchParams.get("depart")||"",
      dropoff: url.searchParams.get("dropoff")||url.searchParams.get("ret")||""
    });
  }

  if (!target) return NextResponse.redirect(new URL("/", url), 307);

  const u = new URL(target);
  // UTM + nostri id + subid
  withParams(u, {
    utm_source: "vrabo", utm_medium: "aff", utm_campaign: prov.toLowerCase(),
    vrabo_sid: sid, vrabo_cid: cid
  });
  u.searchParams.set(subParam(prov), `${sid}:${cid}`);

  // webhook opzionale
  const hook = process.env.TRACK_WEBHOOK_URL;
  if (hook) {
    fetch(hook, { method:"POST", headers:{ "content-type":"application/json" },
      body: JSON.stringify({ ts: Date.now(), mode, prov, sid, cid,
        params: Object.fromEntries(url.searchParams.entries()) })
    }).catch(()=>{});
  }

  const res = NextResponse.redirect(u.toString(), 302);
  res.headers.set("Cache-Control", "no-store");
  res.cookies.set("vrabo_sid", sid, { path:"/", sameSite:"Lax", maxAge:60*60*24*365 });
  return res;
}
