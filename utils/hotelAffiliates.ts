import { HOTEL_PROVIDERS, type HotelProvider } from "@/config/hotelProviders";
import { withUTM, withRef } from "@/utils/utm";
import { fillTemplate } from "@/utils/template";
const env = (k:string)=> (process.env as any)[k] as string|undefined;
export function hotelLink(p: HotelProvider, city?: string, checkin?: string, checkout?: string, adults?: number) {
  let url = p.site;
  const aff = p.affiliateEnv ? env(p.affiliateEnv) : undefined;
  if (p.searchTemplate && city && checkin && checkout) {
    url = fillTemplate(p.searchTemplate, { city, checkin, checkout, adults: String(adults||1), aff });
  }
  if (p.referralParam && aff) url = withRef(url, p.key, p.referralParam);
  return withUTM(url);
}
export { HOTEL_PROVIDERS };
