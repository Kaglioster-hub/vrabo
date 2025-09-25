type SearchParams = { from:string; to:string; depart:string; ret?:string; adults?:string };

const API = "https://api.tequila.kiwi.com/v2/search";

export async function kiwiPreview(p: SearchParams){
  const key = process.env.TEQUILA_API_KEY || process.env.KIWI_API_KEY;
  if(!key) return null;

  const date = p.depart?.slice(8,10)+"%2F"+p.depart?.slice(5,7)+"%2F"+p.depart?.slice(0,4); // dd/MM/yyyy
  const dateRet = (p.ret||p.depart);
  const date2 = dateRet?.slice(8,10)+"%2F"+dateRet?.slice(5,7)+"%2F"+dateRet?.slice(0,4);

  const sp = new URLSearchParams({
    fly_from: p.from, fly_to: p.to,
    date_from: date, date_to: date,
    return_from: date2, return_to: date2,
    adults: (p.adults||"1"),
    selected_cabins: "M",
    curr: "EUR",
    sort: "price",
    limit: "50"
  });
  const r = await fetch(`${API}?${sp.toString()}`, { headers:{ apikey: key }, cache:"no-store" } as RequestInit);
  if(!r.ok) return null;
  const j = await r.json();
  const data = (j?.data||[]) as any[];

  if(!data.length) return { picks:null };

  const cheapest = data.reduce((a,b)=> b.price < a.price ? b : a, data[0]);
  const fastest  = data.reduce((a,b)=> b.duration?.total < a.duration?.total ? b : a, data[0]);
  const best     = data.reduce((a,b)=> (b.quality||0) > (a.quality||0) ? b : a, data[0]);

  const map = (x:any)=>({
    price: x.price,
    currency: j?.currency || "EUR",
    durationMin: Math.round((x.duration?.total||0)/60),
    airline: (x.route?.[0]?.airline)||"",
    flight_no: (x.route?.[0]?.flight_no)||"",
    deep_link: x.deep_link as string,
    summary: `${(x.route?.[0]?.airline)||""} ${x.route?.[0]?.flight_no||""} · ${Math.round((x.duration?.total||0)/60)}m · €${x.price}`
  });

  return { picks:{
    cheap: map(cheapest),
    fast:  map(fastest),
    best:  map(best)
  }};
}
