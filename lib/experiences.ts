export function buildGygURL(city:string){
  const base = process.env.NEXT_PUBLIC_AFF_ID_TICKETS1 || "https://www.getyourguide.com/";
  const u = new URL(base);
  if(!u.searchParams.get("partner_id")) u.searchParams.set("partner_id","9IDBTNP");
  u.pathname = "/s/"; u.searchParams.set("q", city);
  return u.toString();
}
