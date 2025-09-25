import { NextResponse } from "next/server";
import { affiliates } from "@/config/affiliates";

type Item = { provider:string; url:string; category:string; promo?:string };

function promoForService(key:string){
  const env = process.env[`PROMO_${key.toUpperCase()}`];
  return env || undefined;
}

export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase();

  const base: Item[] = [
    // Finanza
    { provider:"eToro",   url: affiliates.etoro.url,   category:"finanza", promo: promoForService("etoro") },
    { provider:"Revolut", url: affiliates.revolut.url, category:"finanza", promo: promoForService("revolut") },
    { provider:"Wise",    url: affiliates.wise.url,    category:"finanza", promo: promoForService("wise") },
    { provider:"N26",     url: affiliates.n26.url,     category:"finanza", promo: promoForService("n26") },

    // Crypto
    { provider:"Binance", url: affiliates.binance.url, category:"crypto",  promo: promoForService("binance") },
    { provider:"KuCoin",  url: affiliates.kucoin.url,  category:"crypto",  promo: promoForService("kucoin") },

    // Telefonia (eSIM)
    { provider:"Vodafone eSIM", url: affiliates.vodafoneEsim.url, category:"telefonia" },
    { provider:"Airalo eSIM",   url: affiliates.airalo.url,       category:"telefonia" },

    // Assicurazioni
    { provider:"Assicurazione Viaggio", url: affiliates.travelIns.url, category:"assicurazioni" },
  ];

  const list = q
    ? base.filter(b => b.provider.toLowerCase().includes(q) || b.category.toLowerCase().includes(q))
    : base;

  return NextResponse.json({ ok:true, items:list });
}
